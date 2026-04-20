# Firestore Security Specification

## Data Invariants
1. **User Ownership**: A user document must have a `uid` that matches their Firebase Auth UID.
2. **Habit Ownership**: A habit must have a `userId` that matches the creator's UID.
3. **Buddy Sync**: Buddy relationships are mutual. A `buddyId` on User A must be reflected by User B's `buddyId` being User A.
4. **Immutable Fields**: `createdAt`, `userId`, `id` fields should be immutable after creation.
5. **Terminal State**: Habits marked as 'completed' (for one-time tasks) or 'archived' (future field) should be locked.
6. **Temporal Integrity**: `createdAt` and `updatedAt` must use server time.

## The "Dirty Dozen" Payloads (Attack Vectors)

| ID | Attack Name | Target Path | Malicious Payload | Expected Result |
|---|---|---|---|---|
| 1 | Identity Spoofing (Create) | `/users/victim_uid` | `{ "uid": "victim_uid", "displayName": "Attacker" }` | PERMISSION_DENIED |
| 2 | Identity Spoofing (Write) | `/users/attacker_uid` | `{ "uid": "victim_uid", ... }` | PERMISSION_DENIED (uid must match auth.uid) |
| 3 | Privilege Escalation | `/users/attacker_uid` | `{ "role": "admin" }` | PERMISSION_DENIED (role is system-only) |
| 4 | Orphaned Record | `/habits/h1` | `{ "userId": "victim_uid", "name": "Fake Habit" }` | PERMISSION_DENIED |
| 5 | Update Gap (Buddy) | `/users/victim_uid` | `{ "buddyId": "attacker_uid" }` | PERMISSION_DENIED (Must be mutual or through req) |
| 6 | Resource Poisoning | `/users/attacker_uid` | `{ "displayName": "A".repeat(10000) }` | PERMISSION_DENIED (Size limit) |
| 7 | ID Injection | `/users/INVALID_ID` | `{ ... }` | PERMISSION_DENIED (isValidId check) |
| 8 | Timestamp Spoofing | `/habits/h1` | `{ "createdAt": "2000-01-01T00:00:00Z" }` | PERMISSION_DENIED (Must use server time) |
| 9 | Shadow Field | `/habits/h1` | `{ "name": "H1", "extraField": true }` | PERMISSION_DENIED (Strict schema) |
| 10| PII Leak | `/users/victim_uid` | `get()` (as stranger) | PERMISSION_DENIED (Stranger cannot read victim profile) |
| 11| Unauthorized Nudge | `/nudges/n1` | `{ "toUid": "stranger_uid", ... }` | PERMISSION_DENIED (Can only nudge buddies) |
| 12| Fake Check-in | `/checkins/c1` | `{ "userId": "victim_uid", "completed": true }` | PERMISSION_DENIED |

## Design Verification Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|---|---|---|---|
| users | Protected by `isOwner(userId)` and `hasOnlyAllowedFields` | Protected by `affectedKeys` on buddy requests | Protected by size and regex checks |
| habits | Protected by `request.auth.uid == incoming().userId` | N/A | Protected by size and type checks |
| checkins| Protected by `request.auth.uid == incoming().userId` | N/A | Protected by type checks |
| messages| Protected by `request.auth.uid == incoming().fromUid`| Immutable (no update/delete) | Protected by size limits |
| nudges | Protected by `request.auth.uid == incoming().fromUid`| Immutable (no update/delete) | Protected by type checks |
