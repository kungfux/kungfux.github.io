---
title: Git cheat sheet
description: A note on the key Git commands.
date: 2024-11-13 00:41:16 +0400
last_modified_at: 2024-11-13 00:41:16 +0400
published: true
categories: [Posts, Software Development]
tags: [Git]
mermaid: false
media_subpath: /assets/media/2024/git-cheat-sheet/
image: cover.webp
---

## Introduction
This is not a comprehensive guide to Git commands, but a notebook I made for myself to quickly find the ones I have not used in a while and may have forgotten. For a comprehensive and up-to-date reference, check out the Git docs[^GitDocs] or the Git Pro book[^ProGitBook].

> Use the table of contents to quickly jump to the topic you're interested in.
{: .gh-alert.tip }

## Setup and configuration
### Install Git
#### Git installer
Get the installer from the official website[^GitDownloads].

#### WinGet[^WinGet]
```shell
winget install --id Git.Git
```

### Update Git
#### WinGet[^WinGet].
```shell
winget update --id Git.Git
```

#### Git
```bash
git update-git-for-windows
```

### Check Git version
```bash
git --version
```

### Configure Git
#### View all configurations
```bash
# List all variables
git config list

# List variables from current repository only
git config list --local

# List global variables
git config list --global
```

#### View and set specific configurations
```bash
# View username and email configured globally
git config --global user.name
git config --global user.email

# Set username and email globally
git config --global user.name "first last"
git config --global user.email "user@gmail.com"

# View username and email for current repository
git config user.name
git config user.email

# Set  username and email for current repository
git config user.name "first last"
git config user.email "user@gmail.com"
```

> See related recipe on how to [Update user email after committing the wrong one](#update-user-email-after-committing-the-wrong-one).
{: .gh-alert.note }

## Manage repository
### Create repository
```bash
git init .
```

### Clone a repository
```bash
git clone https://github.com/kungfux/project.git
```

## Make changes
### Add files to staging
```bash
# Add all changes
git add .

# Add files by mask
git add *.cs

# Add ignored file
git add -f ignored.file

# Add new filepath only
git add -N new.file
```

### Commit changes
```bash
# Commit with a message
git commit -m "My message"

# Automatically stage modified and removed files and commit
git commit -a

# Reuse commit info from the log
git commit -c
```

## Align changes
### Rebase
```bash
# Align changes with `main` branch
git checkout feature/my-feature
git rebase main
git push --force-with-lease

# Interactive rebase
git rebase -i main

# Rebase a branch onto a different branch
git rebase –onto new-branch-name old-branch-name
```

## Copy changes
### Merge
> Please check the section on [Merge branches](#merge-branches).
{: .gh-alert.note }

### Cherry-pick
```bash
# Copy commit
git cherry-pick <hash>

# Copy commit changes without committing
git cherry-pick -n <hash>
```

## Undo changes
### Staged changes
```bash
# Unstage a file
git reset staged-file-name.txt
```

### Uncommitted changes
```bash
# Undo changes for a single file
git checkout -- file.name

# Undo changes for all files
git checkout -- .

# Remove untracked files
git clean -df

# Remove untracked and ignored files
git clean -dfX

# Show what would be removed
git clean -n
```

### Committed changes
```bash
# Update last commit
git commit --amend

# Revert to a previous state by removing commits
git commit -m "Something terribly misguided"
git reset HEAD~
# ... edit files as necessary ...
git add .
git commit -c ORIG_HEAD

# Undo reset HEAD~
git reset HEAD@{1}

# Create a commit right away undoing changes
git revert <hash>

# Undo a commit and leave changes uncommitted
git revert -n 3ec5bed

# Abort incomplete reverting
git revert --abort
```

## Postpone changes
### Create stash
```bash
# Stash tracked changes only
git stash

# Stash with untracked changes
git stash -u

# Stash with untracked and ignored files
git stash -a

# Stash changes with a comment
git stash -m “My changes”
```

### View stashes
```bash
# View stashes list
git stash list

# View stash summary
git stash show stash@{0}

# View stash details
git stash show -p stash@{0}
```

### Apply stash
```bash
# Apply stash and preserve it in list
git stash apply stash@{0}

# Apply last stash and remove it
git stash pop
```

### Remove stash
```bash
# Remove stash
 git stash drop stash@{0}
```

## Share changes
### Share as a patch file
```bash
# Create `name.patch` patch file with changes produced by `diff`
git diff > name.patch
git diff HEAD > name.patch

# Include new file into patch
git add -N new-file.txt

# Create patch for last commit
git diff HEAD^ HEAD > name.patch
```

### Apply patch
```bash
git apply name.patch
```

## Inspect changes
### Check repository state
```bash
git status
```

### Show uncommitted changes
```bash
# Show changes for tracked but not staged changes
git diff

# Show changes for the file
git diff changed.file
```

### Compare changes between commits
```bash
# Show changes from last commit
git diff HEAD^ HEAD

# Compare two commits
git diff <hash1> <hash2>
```

### Compare changes between branches
```bash
# Compare `main` and `dev` branches
git diff main..dev
```

### View commit history
```bash
# Show history
git log --graph --abbrev-commit

# Show changes for a particular file
git log file.name

# Show changes for a particular folder
git log folder-name/

# View commit details and diff
git show 3a5sd4

# View per line author information
git blame -w file.name
```

## Branching and merging
### Create branch
```bash
git checkout -b feature/new-feature
```

### Rename branch
```bash
# Rename local branch
git branch -m new-name
```

### Switch branches
```bash
# Switch to a branch
git checkout branch-name

# Switch back
git checkout -
```

### Merge branches
```bash
# Merge branch into current one
git checkout main
git merge feature/my-feature

# Squash merge
git checkout main
git merge --squash feature/my-feature
git commit -m "Add feature X (squashed commit)"
```

### Delete branches
```bash
# Delete local branch if it's merged in the upstream
git branch -d branch-name

# Delete local branch anyways
git branch -D branch-name
```

## Remote repositories
### List remotes
```bash
# List all remotes
git remote show

# Show details on `origin` remote
git remote show origin
```

### Add remote
```bash
# Add remote for the first time
git remote add origin https://github.com/kungfux/project.git

# Add remote with a new name
git remote add new-home https://github.com/kungfux/project.git
```

### Push changes to remote
```bash
git push -u origin branch-name
```

### Fetch and pull from remote
```bash
# Fetch updates from remote
git fetch

# Get updates from remote
git pull
```

### Remove remote branch
```bash
git push origin --delete branch-name
```

### Remove remote
```bash
git remote remove origin
```

## Recipes
### Update user email after committing the wrong one
```bash
git config user.email "kungfux@users.noreply.github.com"
git commit --amend --reset-author --no-edit
git push
```

### Move git repository to new home
```bash
git remote add new-home https://github.com/kungfux/project.git
git push --all new-home
git push --tags new-home
git remote remove origin
git remote rename new-home origin
```

### Skip SSL verification for a single command
```bash
git -c http.sslVerify=false clone https://github.com/kungfux/project.git
```

## Visual tools
The routine operations and diff are easier to execute from GUI applications. The applications like VS Code, GitHub Desktop and maybe others made a great job on making interaction with Git a much easier. Here are some tools I would recommend:
- VS Code[^VSCode]
- VS Code extensions
  - `mhutchie.git-graph`
  - `pomber.git-file-history`
- GitHub Desktop[^GitHubDesktop]

## References
[^GitDownloads]: [Git downloads](https://git-scm.com/downloads)
[^WinGet]: [WinGet](https://kungfux.github.io/posts/easy-software-updates)
[^ProGitBook]: [Pro Git Book](https://git-scm.com/book/)
[^GitDocs]: [Git Docs](https://git-scm.com/docs)
[^VSCode]: [VS Code](https://code.visualstudio.com/)
[^GitHubDesktop]: [GitHub Desktop](https://desktop.github.com/download/)
