async function getStandings () {
  const api = $('#standings_api').val()
  const baseUrl = new URL(api)
  const results = []

  while (true) {
    const resp = await fetch(baseUrl, { method: 'GET' })
    const json = await resp.json()

    results.push(json.results)
    baseUrl.searchParams.set('page', json.next)

    if (json.next == null) break
    await new Promise(r => setTimeout(r, 850))
  }

  const resultsMerged = []
  let rank = 0
  for (const result of results) {
    for (const [index, element] of result.entries()) {
      rank += 1
      element.rank = rank
      resultsMerged.push(element)
    }
  }
  return resultsMerged
}

async function getContestMeta () {
  const api = $('#contest_api').val()
  const resp = await fetch(api, { method: 'GET' })
  return await resp.json()
}

function getDuration (starts, ends) {
  const diff = parseInt(new Date(starts) - new Date(ends)) / 1000

  const hrs = parseInt(diff / 3600)
  const min = parseInt((diff - hrs * 3600) / 60)
  return `${hrs.toString().padStart(2, 0)}:${min.toString().padStart(2, 0)}`
}

function getContestStatus (ends) {
  return parseInt(new Date(ends) - Date.now()) > 0 ? 'Running' : 'Ended'
}

function formatDtString (text) {
  const dt = new Date(text)
  return `${dt.getUTCDate()}-${dt.getUTCMonth() + 1}-${dt.getUTCFullYear()} ${dt
    .getHours()
    .toString()
    .padStart(2, '0')}:${dt
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dt
        .getSeconds()
        .toString()
        .padStart(2, '0')}`
}

function setContestMeta (json) {
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

function setProblemSetMeta (problemSet) {
  const table = document.querySelector('table.team-list')
  const thead = table.querySelector('thead tr')

  for (const problem of problemSet) {
    const html = `<span class='th-problem'>${problem.problem_order_character}</td>`
    const row = thead.appendChild(document.createElement('th'))
    row.classList.add('center')
    row.classList.add('problem-th')
    row.innerHTML = html
  }

  $('#max_solv').attr('max', problemSet.length)
  $('#max_solv').attr('value', problemSet.length)
  M.updateTextFields()
}

function populateTeamName (results) {
  const teamNames = {}
  for (const result of results) {
    teamNames[result.fullname] = null
  }
  return teamNames
}

function populateInstitutionName (results) {
  const institutionNames = {}
  for (const result of results) {
    if (result.institution) institutionNames[result.institution.toUpperCase()] = null
  }
  return institutionNames
}

function genUniRank (data) {
  const output = {}
  let i = 0
  for (const result of data) {
    if (output[result.institution]) continue

    const data = {}

    i += 1
    data.uni_rank = i
    data.rank = result.rank
    data.team_name = result.fullname
    data.problem_total_points = result.problem_total_points
    data.total_fine = result.total_fine
    output[result.institution] = data
  }
  return output
}

function genUniRankTd (unis) {
  const output = []
  for (const uni in unis) {
    const data = []
    data.push(`<div class="center td_team_rank">${unis[uni].uni_rank}</div>`)
    data.push(`<div class="center td_team_rank">${unis[uni].rank}</div>`)
    data.push(
      `<span class="td_teamName">${uni.toUpperCase()}</span></br><span class="td_inst_name">${unis[uni].team_name
      }</span>`
    )
    data.push(
      `<div class="center">${unis[uni].problem_total_points}<br>(${unis[uni].total_fine})</div>`
    )
    output.push(data)
  }
  return output
}

async function init () {
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
    const api = 'https://icpc-preliminary-dhaka-2023.kurtnettle.workers.dev/'
    const resp = await fetch(api, { method: 'GET' })
    data = await resp.json()
    localStorage.setItem('secret_data', JSON.stringify(data))
  }

  setContestMeta(data.contestMeta)
  setProblemSetMeta(data.contestMeta.problem_set)
  document.getElementById('last-update-span').textContent = formatDtString(
    data.lastUpdate
  )

  M.Autocomplete.getInstance($('#team_name')).updateData(populateTeamName(data.teamStats))
  M.Autocomplete.getInstance($('#institution_name')).updateData(populateInstitutionName(data.teamStats))

  const uniRankData = genUniRankTd(genUniRank(data.teamStats))

  const uniRankTable = $('#uni_rank_tb').DataTable({
    dom: 'p<"chip"i>t',
    paging: true,
    data: uniRankData,
    autoWidth: false,
    pageLength: 70,
    ordering: false,
    orderClasses: false,
    language: {
      paginate: {
        next: '<i class="material-icons blue-text">chevron_right</i>',
        previous: '<i class="material-icons blue-text">chevron_left</i>'
      }
    }
  })

  $('#institution_name_rank').on('keyup change', function () {
    uniRankTable.draw()
  })
  return data.teamStats
}
