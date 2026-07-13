# Idea Vault

A MERN stack app where users post ideas publicly and the community votes them good or bad.

## Language

**Idea**:
A public post with a title, plain-text description, and status (`open`/`closed`). Created by one user.
_Avoid_: post, entry, submission

**Vote**:
A binary judgment (`good`/`bad`) on an open idea. One vote per user per idea. Users cannot vote on their own ideas. A user may change their existing vote.
_Avoid_: reaction, like, rating

**Comment**:
A text response on an idea. Anyone including the author can comment. The author of the idea can delete any comment. Comments can be edited by their own author.
_Avoid_: reply, remark, note

**Author**:
The user who created an idea. Has exclusive rights: close/reopen their own ideas, delete any comment on their ideas.
_Avoid_: creator, owner, poster

**Status**:
`open` (accepting votes) or `closed` (votes locked). Set exclusively by the author.
_Avoid_: state, phase, lifecycle

**Score**:
Aggregated display of votes: raw good count, raw bad count, and percentage. Computed, not stored.
_Avoid_: rating, tally, result

**User**:
A registered person with email/password credentials. Can post ideas, vote on others' ideas, and comment.
_Avoid_: account, member, participant
