#!/bin/bash
# 自動解決合併衝突 - 保留兩邊的改動

cd /home/jerry/.openclaw/workspace/projects/github-os

# 合併 github.js 的 imports
cat > /tmp/github-import.txt << 'EOF'
import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists, getRepoInfo, getCache, searchCode, fetchRepoCommits, fetchRepoBranches, fetchRepoTree, fetchRepoIssues, fetchRepoContributors, fetchRepoReleases, getFile, createFile, deleteFile, checkFileExists, getDefaultBranchSHA, createBranch, deleteBranch, clearBranchCache, batchCommit, createPR, mergePR, closePR, fetchPR, fetchIssue, createIssue, updateIssue, addIssueComment, fetchUserOrgs, fetchOrgInfo, fetchOrgRepos, fetchOrgTeams, fetchTeamRepos, fetchTeamMembers, fetchNotifications, markNotificationsRead, fetchWorkflowRuns, fetchWorkflowRun, fetchWorkflowJobs, fetchWorkflowLogs, rerunWorkflow, fetchWorkflows } from './github.js';
EOF

# 合併 commands.js 的 imports  
cat > /tmp/commands-import.txt << 'EOF'
import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists, getRepoInfo, getCache, searchCode, fetchRepoCommits, fetchRepoBranches, fetchRepoTree, fetchRepoIssues, fetchRepoContributors, fetchRepoReleases, getFile, createFile, deleteFile, checkFileExists, getDefaultBranchSHA, createBranch, deleteBranch, clearBranchCache, batchCommit, createPR, mergePR, closePR, fetchPR, fetchIssue, createIssue, updateIssue, addIssueComment, fetchUserOrgs, fetchOrgInfo, fetchOrgRepos, fetchOrgTeams, fetchTeamRepos, fetchTeamMembers, fetchNotifications, markNotificationsRead, fetchWorkflowRuns, fetchWorkflowRun, fetchWorkflowJobs, fetchWorkflowLogs, rerunWorkflow, fetchWorkflows } from './github.js';
EOF

# 使用 Python 腳本處理衝突
python3 << 'PYTHON'
import re

# 處理 commands.js
with open('scripts/commands.js', 'r') as f:
    content = f.read()

# 統一的 import 語句
combined_import = "import { fetchUserRepos, fetchRepoContents, fetchFileContent, repoExists, getRepoInfo, getCache, searchCode, fetchRepoCommits, fetchRepoBranches, fetchRepoTree, fetchRepoIssues, fetchRepoContributors, fetchRepoReleases, getFile, createFile, deleteFile, checkFileExists, getDefaultBranchSHA, createBranch, deleteBranch, clearBranchCache, batchCommit, createPR, mergePR, closePR, fetchPR, fetchIssue, createIssue, updateIssue, addIssueComment, fetchUserOrgs, fetchOrgInfo, fetchOrgRepos, fetchOrgTeams, fetchTeamRepos, fetchTeamMembers, fetchNotifications, markNotificationsRead, fetchWorkflowRuns, fetchWorkflowRun, fetchWorkflowJobs, fetchWorkflowLogs, rerunWorkflow, fetchWorkflows } from './github.js';"

# 移除所有衝突標記，保留合併後的內容
def resolve_conflicts(text):
    # Pattern to match conflict blocks
    pattern = r'<<<<<<< ours\n(.*?)\n=======\n(.*?)\n>>>>>>> theirs'
    
    def merge_block(match):
        ours = match.group(1)
        theirs = match.group(2)
        
        # If it's the import line, use combined version
        if 'fetchUserRepos' in ours and 'from' in ours:
            return combined_import
        
        # For command registry, merge both
        if 'org:' in ours or 'notifications:' in theirs:
            # Combine both sets of commands
            lines_ours = [l.strip() for l in ours.split('\n') if l.strip() and not l.strip().startswith('//')]
            lines_theirs = [l.strip() for l in theirs.split('\n') if l.strip() and not l.strip().startswith('//')]
            
            # Merge and deduplicate
            all_lines = []
            seen = set()
            for line in lines_ours + lines_theirs:
                key = line.split(':')[0] if ':' in line else line
                if key not in seen:
                    all_lines.append(line)
                    seen.add(key)
            
            return '\n  '.join(all_lines)
        
        # Default: keep both (theirs first, then ours)
        return theirs + '\n' + ours
    
    return re.sub(pattern, merge_block, text, flags=re.DOTALL)

content = resolve_conflicts(content)

with open('scripts/commands.js', 'w') as f:
    f.write(content)

print("Resolved commands.js conflicts")

# 處理 github.js  
with open('scripts/github.js', 'r') as f:
    content = f.read()

content = resolve_conflicts(content)

with open('scripts/github.js', 'w') as f:
    f.write(content)

print("Resolved github.js conflicts")
PYTHON

echo "Conflicts resolved!"
