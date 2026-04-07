// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EqubGroup {
    struct Member {
        bool joined;
        bool hasReceivedPayout;
        uint256 contributionCount;
        uint256 totalContributed;
        uint256 joinedAt;
        uint256 position;
    }

    string public groupName;
    uint256 public contributionAmount;
    uint256 public totalMembers;
    uint256 public frequencyInSeconds;
    address public creator;
    bool public started;
    bool public completed;
    uint256 public currentRound;
    uint256 public totalPool;
    mapping(address => uint256) private walletBalances;

    address[] public memberList;
    mapping(address => Member) public members;

    event MemberJoined(address member, uint256 timestamp);
    event ContributionMade(address member, uint256 amount, uint256 round);
    event PayoutDistributed(address winner, uint256 amount, uint256 round);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event WinningTransferred(address indexed winner, uint256 amount, address indexed group);
    event GroupStarted(uint256 timestamp);
    event GroupCompleted();

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator");
        _;
    }

    modifier onlyMember() {
        require(members[msg.sender].joined, "Only member");
        _;
    }

    constructor(
        string memory _groupName,
        uint256 _contributionAmount,
        uint256 _totalMembers,
        uint256 _frequencyInSeconds,
        address _creator
    ) {
        require(_totalMembers >= 2, "At least two members");
        groupName = _groupName;
        contributionAmount = _contributionAmount;
        totalMembers = _totalMembers;
        frequencyInSeconds = _frequencyInSeconds;
        creator = _creator;
    }

    function joinGroup() external {
        require(!started, "Group already started");
        require(!members[msg.sender].joined, "Already joined");
        require(memberList.length < totalMembers, "Group full");

        members[msg.sender] = Member({
            joined: true,
            hasReceivedPayout: false,
            contributionCount: 0,
            totalContributed: 0,
            joinedAt: block.timestamp,
            position: memberList.length + 1
        });

        memberList.push(msg.sender);
        emit MemberJoined(msg.sender, block.timestamp);
    }

    function startGroup() external onlyCreator {
        require(!started, "Already started");
        require(memberList.length == totalMembers, "Group not full");
        started = true;
        currentRound = 1;
        emit GroupStarted(block.timestamp);
    }

    function makeContribution() external payable onlyMember {
        require(started, "Group not started");
        require(!completed, "Group completed");
        require(msg.value == contributionAmount, "Invalid contribution");

        Member storage member = members[msg.sender];
        member.contributionCount += 1;
        member.totalContributed += msg.value;
        totalPool += msg.value;

        emit ContributionMade(msg.sender, msg.value, currentRound);
    }

    function distributePayout() external onlyCreator {
        require(started, "Group not started");
        require(!completed, "Group completed");

        address winner = calculateWinner();
        uint256 payoutAmount = totalPool;

        members[winner].hasReceivedPayout = true;
        totalPool = 0;
        payable(winner).transfer(payoutAmount);

        emit PayoutDistributed(winner, payoutAmount, currentRound);

        if (currentRound >= totalMembers) {
            completed = true;
            emit GroupCompleted();
        } else {
            currentRound += 1;
        }
    }

    function depositToWallet() external payable {
        require(msg.value > 0, "Amount required");
        walletBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdrawFromWallet(uint256 amount) external {
        require(walletBalances[msg.sender] >= amount, "Insufficient balance");
        walletBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function transferWinning(address winner, uint256 amount) external onlyCreator {
        require(totalPool >= amount, "Insufficient pool");
        totalPool -= amount;
        walletBalances[winner] += amount;
        emit WinningTransferred(winner, amount, address(this));
    }

    function getWalletBalance(address user) external view returns (uint256) {
        return walletBalances[user];
    }

    function getGroupInfo() external view returns (
        string memory name,
        uint256 amount,
        uint256 memberTarget,
        uint256 memberCount,
        uint256 frequency,
        bool isStarted,
        bool isCompleted,
        uint256 round
    ) {
        return (
            groupName,
            contributionAmount,
            totalMembers,
            memberList.length,
            frequencyInSeconds,
            started,
            completed,
            currentRound
        );
    }

    function getMemberInfo(address memberAddress) external view returns (Member memory) {
        return members[memberAddress];
    }

    function calculateWinner() public view returns (address) {
        require(memberList.length > 0, "No members");

        for (uint256 i = 0; i < memberList.length; i++) {
            if (!members[memberList[i]].hasReceivedPayout) {
                return memberList[i];
            }
        }

        revert("No eligible winner");
    }
}
