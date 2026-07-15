"""Notify checks script

Usage:
  python notify_checks.py [--days N] [--send]

By default the script runs in dry-run mode and logs what would be sent.
Pass --send to actually attempt sending emails via the configured Gmail integration.
"""
from datetime import datetime, timedelta
import os
import argparse
from pymongo import MongoClient

try:
    # Prefer local project utils if running inside app package
    from app.utils.email import send_email
except Exception:
    # Fallback if not importable
    from app.utils.email import send_email


def get_db():
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.environ.get("MONGO_DB", "equb_db")
    client = MongoClient(mongo_uri)
    return client[db_name]


def query_recent(db, collection, query, since):
    q = {**query, "$or": [{"created_at": {"$gte": since}}, {"createdAt": {"$gte": since}}]}
    try:
        return list(db[collection].find(q))
    except Exception:
        return list(db[collection].find(query))


def main(days: int = 1, do_send: bool = False):
    since = datetime.utcnow() - timedelta(days=days)
    db = get_db()

    deposits = query_recent(db, "wallet_transactions", {"type": "deposit"}, since)
    withdrawals = query_recent(db, "wallet_transactions", {"type": "withdrawal"}, since)
    # Paid equb: completed round_payments in timeframe or groups ready for winner
    round_payments = query_recent(db, "round_payments", {"status": "completed"}, since)
    winner_records = query_recent(db, "winner_records", {}, since)

    users = list(db["users"].find({}))
    emails = [u.get("email") for u in users if u.get("email")]

    summary = {
        "since": since.isoformat(),
        "deposits_count": len(deposits),
        "withdrawals_count": len(withdrawals),
        "round_payments_completed": len(round_payments),
        "winners_count": len(winner_records),
    }

    subject = f"DigiEqub - Daily Activity Summary ({summary['since']})"
    body = [
        f"<h2>DigiEqub Activity Summary (last {days} day(s))</h2>",
        f"<p>Deposits: <strong>{summary['deposits_count']}</strong></p>",
        f"<p>Withdrawals: <strong>{summary['withdrawals_count']}</strong></p>",
        f"<p>Paid rounds completed: <strong>{summary['round_payments_completed']}</strong></p>",
        f"<p>Winners selected: <strong>{summary['winners_count']}</strong></p>",
    ]

    # Add small details lists (limit to first 10 each)
    def fmt_tx(tx):
        return f"{tx.get('_id')} — {tx.get('user_id') or tx.get('wallet_id')} — {tx.get('amount')} ETB"

    if deposits:
        body.append("<h3>Recent Deposits</h3>")
        body.append("<ul>")
        for d in deposits[:10]:
            body.append(f"<li>{fmt_tx(d)}</li>")
        body.append("</ul>")

    if withdrawals:
        body.append("<h3>Recent Withdrawals</h3>")
        body.append("<ul>")
        for w in withdrawals[:10]:
            body.append(f"<li>{fmt_tx(w)}</li>")
        body.append("</ul>")

    if round_payments:
        body.append("<h3>Completed Rounds</h3>")
        body.append("<ul>")
        for r in round_payments[:10]:
            body.append(f"<li>{r.get('_id')} — {r.get('group_name')} — Round {r.get('round_number')} — Collected {r.get('total_collected')}</li>")
        body.append("</ul>")

    if winner_records:
        body.append("<h3>Winners</h3>")
        body.append("<ul>")
        for w in winner_records[:10]:
            body.append(f"<li>{w.get('_id')} — {w.get('winner_name')} — {w.get('winner_amount')} ETB — Group {w.get('group_name')}</li>")
        body.append("</ul>")

    full_body = "\n".join(body)

    # Dry-run: print summary and sample recipients
    print("Summary:")
    for k, v in summary.items():
        print(f"  {k}: {v}")
    print(f"Recipients: {len(emails)} (showing up to 10)")
    for e in emails[:10]:
        print(f"  - {e}")

    if not do_send:
        print("Dry-run mode. Use --send to actually deliver emails through Gmail.")
        return 0

    # Send emails
    failures = []
    for idx, email in enumerate(emails):
        personal_subject = subject
        try:
            result = send_email(email, personal_subject, full_body)
            if isinstance(result, dict) and result.get("status") == "sent":
                print(f"Sent to {email} ({idx+1}/{len(emails)})")
            else:
                print(f"Failed for {email}: {result}")
                failures.append({"email": email, "result": result})
        except Exception as e:
            print(f"Exception sending to {email}: {e}")
            failures.append({"email": email, "error": str(e)})

    print(f"Done. failures={len(failures)}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Notify checks and optionally send emails to users")
    parser.add_argument("--days", type=int, default=1, help="how many days to look back (default 1)")
    parser.add_argument("--send", action="store_true", help="actually send emails (default: dry-run)")
    args = parser.parse_args()
    main(days=args.days, do_send=args.send)
