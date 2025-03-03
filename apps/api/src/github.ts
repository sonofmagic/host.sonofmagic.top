export interface DispatchActionParams {
  user: string
  repo: string
  token: string
}

export function dispatchAction(params: DispatchActionParams) {
  return fetch(`https://api.github.com/repos/${params.user}/${params.repo}/dispatches`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${params.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      // https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api?apiVersion=2022-11-28#user-agent-required
      'User-Agent': 'Awesome-Octocat-App',
    },
    method: 'POST',
    body: JSON.stringify({
      event_type: 'deploy_cdn',
      client_payload: {
        ref: 'main',
        unit: false,
        integration: true,
      },
    }),
  })
}
