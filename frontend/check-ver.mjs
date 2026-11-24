import https from 'https'
https.get('https://registry.npmjs.org/browserslist', (r) => {
  let d = ''
  r.on('data', c => d += c)
  r.on('end', () => {
    const j = JSON.parse(d)
    const vers = Object.keys(j.versions)
    console.log('Latest 15:', vers.slice(-15).join(', '))
    console.log('Latest:', j['dist-tags'].latest)
  })
})
