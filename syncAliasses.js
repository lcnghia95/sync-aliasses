const fs = require('fs')
const request = require('https');
const child_process = require('child_process')

async function setAliasAuto() {
  const startFlag = `cmderr=cd /d "%CMDER_ROOT%"`
  const startSync = ";= rem #============START-SYNC============"
  const endSync = ";= rem #============END-SYNC============"
  let [ gitAlias, aliasLocal] = await Promise.all([
  
    getAliasFromGit(),
    fs.readFileSync( process.env.CMDER_ROOT+ '/config/user_aliases.cmd','utf8')
  ])
  gitAlias = gitAlias.split('\n').filter(item => item)
  gitAlias.push(endSync)
  aliasLocal = aliasLocal.split('\n').filter(item => item)
  const indexStart = aliasLocal.findIndex(i => i.includes(startFlag))
  const indexEnd = aliasLocal.findIndex(i => i.includes(endSync))
  if(indexEnd === -1){
    const alias = [].concat(aliasLocal.slice(0,indexStart+1), gitAlias,  aliasLocal.slice(indexStart+1) )
    alias.splice(indexStart+1,0,startSync)
    fs.writeFileSync(process.env.CMDER_ROOT+ '/config/user_aliases.cmd',alias.join('\n') )
  } else {
    const alias = [].concat(aliasLocal.slice(0,indexStart+1), gitAlias,aliasLocal.slice(indexEnd+1) )
    alias.splice(indexStart+1,0,startSync)
    fs.writeFileSync(process.env.CMDER_ROOT+ '/config/user_aliases.cmd',alias.join('\n') )
  }
  await sh("alias /reload")
}

const getAliasFromGit = async () => {
  return await new Promise((resolve, reject) => {
    const urlGit = `https://${process.env.GIT_ACCESS_TOKEN}@raw.githubusercontent.com/${process.env.GIT_USERNAME}/${process.env.GIT_REPO}/${process.env.GIT_BRANCH}/${process.env.GIT_PATH_FILE_CONFIG}`
    request.get(urlGit, (res) => {
      let result = []
      res.on('data', (d) => {
        result.push(d)
      });
      res.on('end', () => {
        const newBuffer = Buffer.concat(result)
        const data = newBuffer.toString()
        resolve(data)
      })
    }).on('error', (e) => {
      reject(e);
    });
  })
}

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}
setAliasAuto()
