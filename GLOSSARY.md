# GitHub for Jason

A personal browser extension that reshapes github.com pages around how Jason works.

## Language

**My PRs filter**:
The pull request list narrowed to open PRs assigned to me or awaiting my review, together with the avatar toggle that switches between it and GitHub's default list.
_Avoid_: my filter, PR filter, default query

**Enabled repos**:
The user-configured list of entries naming where the My PRs filter applies; empty means it applies nowhere.
_Avoid_: org list, targets, scope

**Entry**:
One line of Enabled repos, either an Owner or a Repo.
_Avoid_: pattern, rule

**Owner**:
A GitHub organization or user account; as an entry it covers every repo it owns.
_Avoid_: org (an owner may be a user)

**Repo**:
A single repository written as `owner/name`; as an entry it covers only that repository.
_Avoid_: project
