# Branch Protection Rules for `main`

Configure these settings in GitHub → Settings → Branches → Branch protection rules → Add rule

## Required Settings

| Setting | Value | Reason |
|---------|-------|--------|
| **Branch name pattern** | `main` | Protect the main branch |
| **Require a pull request before merging** | ✅ Enabled | Enforce code review |
| **Require approvals** | 1 | At least one approving review |
| **Dismiss stale PR approvals when new commits are pushed** | ✅ Enabled | Prevent stale approvals |
| **Require review from Code Owners** | ✅ Enabled | CODEOWNERS must approve |
| **Require status checks to pass before merging** | ✅ Enabled | Block merge on failed CI |
| **Status checks required** | (see list below) | Mandatory CI gates |
| **Require branches to be up to date before merging** | ✅ Enforced | Prevent stale merges |
| **Require linear history** | ✅ Enabled | No merge commits |
| **Include administrators** | ✅ Enforced | Admins cannot bypass |
| **Restrict who can dismiss pull request reviews** | ✅ Enabled | Only owners/maintainers |
| **Allow force pushes** | ❌ Disabled | Prevent history rewrite |
| **Allow deletions** | ❌ Disabled | Prevent branch deletion |

---

## Required Status Checks

These jobs **must pass** before PR can merge:

| Job | Description |
|-----|-------------|
| `detect-changes` | Change detection completed |
| `build-java-services (api-gateway)` | Unit tests + image build |
| `build-java-services (auth-service)` | Unit tests + image build |
| `build-java-services (catalog-service)` | Unit tests + image build |
| `build-java-services (order-service)` | Unit tests + image build |
| `build-java-services (history-service)` | Unit tests + image build |
| `build-storefront` | npm test + lint + image build |
| `qodana` | Static analysis (non-blocking) |
| `trivy-scan` | Container vulnerability scan (non-blocking) |

> **Note**: Qodana and Trivy are `continue-on-error: true` — they surface findings but won't block merges. Tighten after baseline is clean.

---

## CODEOWNERS

Create `.github/CODEOWNERS` in the source repo:

```
# Global owners
* @ayushQUASAR

# Java services
/microservices/api-gateway/ @ayushQUASAR
/microservices/auth-service/ @ayushQUASAR
/microservices/catalog-service/ @ayushQUASAR
/microservices/order-service/ @ayushQUASAR
/microservices/history-service/ @ayushQUASAR

# Storefront
/src/ @ayushQUASAR
/package.json @ayushQUASAR

# CI/CD
/.github/workflows/ @ayushQUASAR
/.github/dependabot.yml @ayushQUASAR

# Deploy repo
/aura-store-deployments/ @ayushQUASAR
```

---

## Environment Protection Rules

For **production** deployments, create a GitHub Environment named `production`:

1. Settings → Environments → New environment: `production`
2. Configure:
   - **Required reviewers**: `@ayushQUASAR` (or team)
   - **Wait timer**: 5 minutes
   - **Deployment branches**: `main` only
   - **Secrets**: `ARGOCD_SERVER`, `ARGOCD_AUTH_TOKEN`, `SLACK_WEBHOOK_URL`, etc.

The `deploy-approval` job in the workflow uses this environment, enforcing manual approval.

---

## PR Preview Environments

ArgoCD ApplicationSet auto-creates preview namespaces:

| PR | Preview URL | Namespace |
|----|-------------|-----------|
| #42 | `https://pr-42.ecommerce.cris-atoms.local` | `pr-42` |
| #43 | `https://pr-43.ecommerce.cris-atoms.local` | `pr-43` |

Auto-cleaned when PR is closed/merged.

---

## Dependabot Auto-Merge

For `patch` updates with passing CI:

```yaml
# In dependabot.yml
allow:
  - dependency-type: "direct"
    dependency-name: "*"
    update-type: "version-update:semver-patch"
```

---

## Merge Queue (Optional)

For high-traffic repos, enable **Merge Queue** in branch settings:

- Auto-queues approved PRs
- Creates temporary test merges
- Only merges if all status checks pass
- Prevents "stale check" failures

---

## Secret Inventory

| Secret | Scope | Purpose |
|--------|-------|---------|
| `DEPLOY_TOKEN` | Repo | Push to aura-store-deployments |
| `GITHUB_TOKEN` | Repo | Built-in, for GHCR push |
| `QODANA_TOKEN` | Repo | JetBrains Qodana Cloud |
| `SLACK_WEBHOOK_URL` | Org/Repo | Failure notifications |
| `GRAFANA_API_KEY` | Repo | Deploy annotations |
| `GRAFANA_URL` | Repo | Grafana endpoint |
| `ARGOCD_SERVER` | Org | ArgoCD API server |
| `ARGOCD_AUTH_TOKEN` | Org | ArgoCD API token |
| `TEAMS_WEBHOOK_URL` | Org/Repo | Teams notifications (optional) |

---

## Quick Validation

```bash
# Test branch protection locally
gh api repos/ayushQUASAR/aura-store/branches/main/protection --jq '.required_status_checks.contexts[]'

# Verify CODEOWNERS
gh api repos/ayushQUASAR/aura-store/contents/.github/CODEOWNERS

# Check environment
gh api repos/ayushQUASAR/aura-store/environments/production
```