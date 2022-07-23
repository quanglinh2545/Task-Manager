const subdomainRegex: RegExp = new RegExp('(.*).mysapogo.com')
export function extractSubDomain(domain: string): string | null {
  let regexExec = subdomainRegex.exec(domain)
  return regexExec ? regexExec[1] : null
}
