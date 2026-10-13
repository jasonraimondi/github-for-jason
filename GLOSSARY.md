# GitHub for Jason

A personal browser extension that reshapes github.com pages around how Jason works.

## Language

**My PRs filter**:
The pull request list narrowed to open PRs I authored, am assigned to, or am asked to review, together with the avatar toggle that switches between it and GitHub's default list.
_Avoid_: my filter, PR filter, default query

**Enabled repos**:
The user-configured list of entries naming where the My PRs filter applies; empty means it applies everywhere.
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

**Stack**:
A chain of pull requests where each one builds on the one below it, shown by GitHub as a stack badge (`1/2`) on each PR in the list.
_Avoid_: chain, series

**Stack color**:
The color filling a stack badge's pill; every PR in a stack shares it, and stacks shown together get different ones until the palette runs out.
_Avoid_: badge color
