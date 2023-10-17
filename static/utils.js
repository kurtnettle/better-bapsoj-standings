async function getStandings() {
  const api = $('#standings_api').val()
  const baseUrl = new URL(api)
  const results = []

  while (true) {
    const resp = await fetch(baseUrl, { method: 'GET' })
    const json = await resp.json()

    results.push(json.results)
    baseUrl.searchParams.set('page', json.next)

    if (json.next == null) break
    await new Promise(r => setTimeout(r, 650))
  }

  const resultsMerged = []
  let rank = 0
  for (const result of results) {
    for (const [index, element] of result.entries()) {
      rank += 1
      element.rank = rank
      resultsMerged.push(element)
    }
    rank += 1
  }
  return resultsMerged
}

async function getContestMeta() {
  const api = $('#contest_api').val()
  const resp = await fetch(api, { method: 'GET' })
  return await resp.json()
}

function getDuration(starts, ends) {
  const diff = parseInt(new Date(starts) - new Date(ends)) / 1000

  const hrs = parseInt(diff / 3600)
  const min = parseInt((diff - hrs * 3600) / 60)
  return `${hrs.toString().padStart(2, 0)}:${min.toString().padStart(2, 0)}`
}

function getContestStatus(ends) {
  return parseInt(new Date(ends) - Date.now()) > 0 ? 'Running' : 'Ended'
}

function formatDtString(text) {
  const dt = new Date(text)
  return `${dt.getUTCDate()}-${dt.getUTCMonth() + 1}-${dt.getUTCFullYear()} ${dt
    .getHours()
    .toString()
    .padStart(2, '0')}:${dt.getMinutes()}:${dt
      .getSeconds()
      .toString()
      .padStart(2, '0')}`
}

function setContestMeta(json) {
  let elem = document.getElementById('contest-title')
  elem.textContent = json.title

  elem = document.getElementById('contest-start-time')
  elem.textContent = formatDtString(json.starts_at)

  elem = document.getElementById('contest-end-time')
  elem.textContent = formatDtString(json.ends_at)

  elem = document.getElementById('contest-duration')
  elem.textContent = `${getDuration(json.ends_at, json.starts_at)} | ${getContestStatus(
    json.ends_at
  )}`
}

function setProblemSetMeta(problemSet) {
  const table = document.querySelector('table.team-list')
  const thead = table.querySelector('thead tr')
  let i = 0
  for (const problem of problemSet) {
    const html = `<span class='th-problem'>${problem.problem_order_character}</td>`
    const row = thead.appendChild(document.createElement('th'))
    row.classList.add('center')
    row.classList.add('problem-th')
    row.innerHTML = html
    i += 1
  }

  $('#max_solv').attr('max', problemSet.length)
  $('#max_solv').attr('value', problemSet.length)
  M.updateTextFields()
}

function populate_team_name(results) {
  const team_names = {}
  for (const result of results) {
    team_names[result.fullname] = null
  }
  return team_names
}

function populate_institution_name(results) {
  const institutionNames = {}
  for (const result of results) {
    institutionNames[result.institution.toUpperCase()] = null
  }
  return institutionNames
}

async function init() {
  M.Collapsible.init($('.collapsible'))
  M.Modal.init($('.modal'))
  M.Autocomplete.init($('.autocomplete'), {
    onAutocomplete: null,
    limit: 10
  })

  let data = localStorage.getItem('secret_data')
  if (data) { data = JSON.parse(data) }

  const min30 = 1800000
  if (!data || new Date() - new Date(data.lastUpdate) > min30) {
    data = {}
    data.teamStats = await getStandings()
    data.contestMeta = await getContestMeta()
    data.lastUpdate = new Date().toISOString()
    localStorage.setItem('secret_data', JSON.stringify(data))
  }

  setContestMeta(data.contestMeta)
  setProblemSetMeta(data.contestMeta.problem_set)
  document.getElementById('last-update-span').textContent = formatDtString(
    data.lastUpdate
  )

  M.Autocomplete.getInstance($('#team_name')).updateData(populate_team_name(data.teamStats))
  M.Autocomplete.getInstance($('#institution_name')).updateData(populate_institution_name(data.teamStats))

  return data.teamStats
}
