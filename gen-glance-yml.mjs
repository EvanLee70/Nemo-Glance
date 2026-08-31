// projects.json -> glance.yml 생성기. 목록갱신.bat 이 projects.json 을 갱신한 뒤 이 스크립트를 돌린다.
// server.port(아래 3013)는 mydh register 때 배정받은 포트와 반드시 같아야 한다 — 네이티브 바이너리라 PORT 환경변수를 읽지 않는다.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', '0. Square Nemo', 'src', 'data', 'projects.json')
const OUT = join(HERE, 'glance.yml')

const y = (s) => JSON.stringify(String(s)) // JSON 문자열 = 유효한 YAML 스칼라

const data = JSON.parse(readFileSync(SRC, 'utf8'))
const projects = data.projects.filter((p) => p.included !== false)

const sites = projects
  .filter((p) => p.online)
  .map((p) => `              - title: ${y(p.name)}\n                url: ${y(p.online)}`)
  .join('\n')

const groups = projects
  .map((p) => {
    const links = []
    if (p.github) links.push(['GitHub', p.github])
    if (p.local) links.push(['로컬', p.local])
    if (p.online) links.push(['온라인', p.online])
    const linkLines = links
      .map(([title, url], i) => {
        const desc = i === 0 ? `\n                    description: ${y(p.tagline)}` : ''
        return `                  - title: ${y(title)}\n                    url: ${y(url)}${desc}`
      })
      .join('\n')
    return `              - title: ${y(p.name)}\n                links:\n${linkLines}`
  })
  .join('\n')

const yml = `# gen-glance-yml.mjs 가 projects.json 에서 자동 생성. 직접 고치지 마라.
server:
  port: 3013
  proxied: true
  base-url: /app/glance

pages:
  - name: Square Nemo
    columns:
      - size: full
        widgets:
          - type: monitor
            title: 서비스 상태
            sites:
${sites}
          - type: bookmarks
            title: 프로젝트 ${projects.length}개
            groups:
${groups}
`

writeFileSync(OUT, yml, 'utf8')
console.log(`glance.yml 생성 완료 — 프로젝트 ${projects.length}개, 상태 체크 ${projects.filter((p) => p.online).length}개`)
