function genTeamList (results) {
  const output = []
  for (const result of results) {
    const data = []
    data.push(`<div class="center td_team_rank">${result.rank}</div>`)
    data.push(
      `<span class="td_teamName">${result.fullname
      }</span></br><span class="td_inst_name">${result.institution.toUpperCase()}</span>`
    )
    data.push(
      `<div class="center">${result.problem_total_points}<br>(${result.total_fine})</div>`
    )

    for (const problem of result.problem_list) {
      if (problem.is_solved) {
        data.push(
          `<div class="center problem-status"><i class="material-icons green-text">lens</i><br><span class="problem-status-0">${problem.total_tries}(${problem.fine})</span></div>`
        )
      } else {
        data.push(
          `<div class="center problem-status" ><i class="material-icons red-text">lens</i><br><span class="problem-status-0">${problem.total_tries}</span></div>`
        )
      }
    }
    output.push(data)
  }
  return output
}

function filterTeamRankTable (settings, searchData, index, rowData, counter) {
  const teamNameInput = document.getElementById('team_name').value
  const institutionName = document.getElementById('institution_name').value
  const isStrict = document.getElementById('strict_ins_name').checked
  const minSolve = document.getElementById('min_solv').value
  const maxSolve = document.getElementById('max_solv').value
  const totalSolved = $(rowData[2])[0].textContent[0]

  rowData = $(rowData[1])

  const tmNm = rowData[0].innerText
  const insNm = rowData[2].innerText

  if (
    tmNm.indexOf(teamNameInput) > -1 &&
    (isStrict ? insNm === institutionName : insNm.indexOf(institutionName) > -1) &&
    totalSolved >= minSolve &&
    totalSolved <= maxSolve
  ) {
    return true
  }
}

function filterUniRankTable (settings, searchData, index, rowData, counter) {
  const institutionName = document.getElementById('institution_name_rank').value
  rowData = $(rowData[2])
  const insNm = rowData[0].innerText
  if (insNm.indexOf(institutionName) > -1) {
    return true
  }
}

function filterTable (settings, searchData, index, rowData, counter) {
  if (settings.nTable.id === 'ranking_tb') {
    return filterTeamRankTable(settings, searchData, index, rowData, counter)
  } else if (settings.nTable.id === 'uni_rank_tb') {
    return filterUniRankTable(settings, searchData, index, rowData, counter)
  }
}
