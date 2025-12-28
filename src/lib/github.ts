export type GitHubCommit = {
  sha: string
  message: string
  url: string
  date: string
  author: {
    name: string
    avatar_url: string
  }
}

/**
 * Parses a GitHub URL (e.g. https://github.com/owner/repo) 
 * into owner and repo strings.
 */
function parseGitHubUrl(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname !== 'github.com') return null
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

/**
 * Fetches latest commits from GitHub REST API.
 * Supports public repos by default. Private repos require GITHUB_TOKEN env var.
 */
export async function getLatestCommits(repoUrl: string, limit = 5): Promise<GitHubCommit[]> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) return []

  const { owner, repo } = parsed
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`
  
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'TylerLundin-Portfolio-CRM'
  }

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(apiUrl, { headers, next: { revalidate: 300 } }) // Cache for 5 mins
    if (!res.ok) {
      console.warn(`[GitHub API] Failed to fetch commits for ${owner}/${repo}: ${res.status} ${res.statusText}`)
      return []
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split('\n')[0], // First line only
      url: c.html_url,
      date: c.commit.author.date,
      author: {
        name: c.author?.login || c.commit.author.name,
        avatar_url: c.author?.avatar_url || ''
      }
    }))
  } catch (err) {
    console.error(`[GitHub API] Error fetching commits:`, err)
    return []
  }
}
