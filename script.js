document.addEventListener("DOMContentLoaded", () => {
  let socialMediaButtons = document.querySelectorAll(".def-badge.is--social")
  const addButton = document.querySelector(".def-badge.is--addnew")
  const rowsContainer = document.querySelector(".sm__rows")
  const readonlyAttribute = "readonly"
  const placeholderAttribute = 'placeholder="Social media name"'
  const savedClass = "is--saved"
  const deleteDivClass = "def-badge__del"
  const rowClass = "sm__row"
  const urlPattern = /^(http|https):\/\/[^ "]+$/

  function displaySavedRows() {
    socialMediaButtons.forEach((button) => {
      const socialMediaName = button
        .querySelector(".def-badge__text")
        .textContent.trim()
      const savedData = localStorage.getItem(socialMediaName)

      if (savedData) {
        const data = JSON.parse(savedData)
        if (data && data.url) {
          addInputRow(data.name, data.url, true, button, true)
          button.classList.add(savedClass)
          addDeleteDiv(button)
        }
      }
    })
  }

  function addDeleteDiv(button) {
    if (!button.querySelector("." + deleteDivClass)) {
      const deleteDiv = document.createElement("div")
      deleteDiv.className = deleteDivClass
      button.appendChild(deleteDiv)
    }
  }

  function updateBadgeList() {
    socialMediaButtons = document.querySelectorAll(".def-badge.is--social")
  }

  function removeCorrespondingRow(badgeName) {
    const rows = Array.from(rowsContainer.querySelectorAll("." + rowClass))
    const matchingRow = rows.find(
      (row) => row.querySelector(".sm--name").value === badgeName
    )
    if (matchingRow) {
      matchingRow.remove()
    }
  }

  function updateBadgeAppearance(badgeName) {
    const badge = Array.from(socialMediaButtons).find(
      (button) =>
        button.querySelector(".def-badge__text").textContent.trim() ===
        badgeName
    )
    if (badge) {
      badge.remove()
      removeCorrespondingRow(badgeName)
    }
    updateBadgeList()
  }

  displaySavedRows()

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("sm--delete")) {
      const row = event.target.closest("." + rowClass)
      const badgeName = row.querySelector(".sm--name").value
      row.remove()
      localStorage.removeItem(badgeName)
      updateBadgeAppearance(badgeName)
    }

    if (event.target.closest("." + deleteDivClass)) {
      const badge = event.target.closest(".def-badge")
      const badgeName = badge
        .querySelector(".def-badge__text")
        .textContent.trim()
      localStorage.removeItem(badgeName)
      updateBadgeAppearance(badgeName)
    }
  })

  socialMediaButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const socialMediaName = button
        .querySelector(".def-badge__text")
        .textContent.trim()
      const savedData = localStorage.getItem(socialMediaName)

      let rowExists = Array.from(
        rowsContainer.querySelectorAll("." + rowClass)
      ).some((row) => row.querySelector(".sm--name").value === socialMediaName)

      if (!rowExists) {
        addInputRow(
          socialMediaName,
          savedData ? JSON.parse(savedData).url : "",
          true,
          button
        )
      }
    })
  })

  addButton.addEventListener("click", () => {
    let emptyRowExists = Array.from(
      rowsContainer.querySelectorAll("." + rowClass)
    ).some(
      (row) =>
        row.querySelector(".sm--name").value === "" &&
        row.querySelector(".sm--url").value === ""
    )

    if (!emptyRowExists) {
      addInputRow("", "", false, null)
    }
  })

  function addInputRow(
    socialMediaName,
    socialMediaUrl,
    isReadOnly,
    correspondingBadge,
    isSaved = false
  ) {
    const inputRow = document.createElement("div")
    inputRow.className = rowClass

    if (isSaved) {
      inputRow.classList.add(savedClass)
    }

    inputRow.innerHTML = `
        <input type="text" class="w-input input-def__field sm--name" value="${socialMediaName}" ${
      isReadOnly ? readonlyAttribute : ""
    } ${isReadOnly ? "" : placeholderAttribute} />
        <input type="text" class="w-input input-def__field sm--url" value="${socialMediaUrl}" placeholder="URL" />
        <div class="sm__action-btns">
          <button class="sm__action-btn sm--save"></button>
          <button class="sm__action-btn sm--delete"></button>
        </div>
      `

    rowsContainer.appendChild(inputRow)

    inputRow.querySelector(".sm--save").addEventListener("click", (event) => {
      saveSocialMedia(event, correspondingBadge)
    })
  }

  function saveSocialMedia(event, correspondingBadge) {
    event.preventDefault()

    const row = event.target.closest("." + rowClass)
    const name = row.querySelector(".sm--name").value.trim()
    const url = row.querySelector(".sm--url").value

    if (!new RegExp(urlPattern).test(url)) {
      alert("Please enter a valid URL.")
      return
    }

    let badge = Array.from(socialMediaButtons).find(
      (button) =>
        button.querySelector(".def-badge__text").textContent.trim() === name
    )

    if (badge) {
      localStorage.setItem(name, JSON.stringify({ name, url }))

      if (!badge.classList.contains(savedClass)) {
        badge.classList.add(savedClass)
      }
      addDeleteDiv(badge)
    } else {
      createNewBadge(name)
      localStorage.setItem(name, JSON.stringify({ name, url }))
    }

    event.target.classList.add(savedClass)
  }

  function createNewBadge(name) {
    const newBadge = document.createElement("div")
    newBadge.className = "def-badge is--social is--saved"
    newBadge.innerHTML = `
        <span class="def-badge__text">${name}</span>
        <div class="def-badge__del"></div>
      `

    newBadge
      .querySelector(".def-badge__del")
      .addEventListener("click", function () {
        newBadge.remove()
        localStorage.removeItem(name)
      })

    const badgeContainer = document.querySelector(".sm__list")
    badgeContainer.insertBefore(newBadge, addButton)
    updateBadgeList()
  }

  function loadBadgesAndRows() {
    const badgeContainer = document.querySelector(".sm__list")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      const data = JSON.parse(localStorage.getItem(key))

      if (data && data.name && data.url) {
        // Check if the badge already exists to avoid duplication
        let badgeExists = Array.from(socialMediaButtons).some(
          (button) =>
            button.querySelector(".def-badge__text").textContent.trim() ===
            data.name
        )

        if (!badgeExists) {
          createNewBadge(data.name)
        }

        // Similarly, check if the row already exists
        let rowExists = Array.from(
          rowsContainer.querySelectorAll("." + rowClass)
        ).some((row) => row.querySelector(".sm--name").value === data.name)

        if (!rowExists) {
          addInputRow(data.name, data.url, true, null, true)
        }
      }
    }
  }

  window.onload = function () {
    loadBadgesAndRows()
  }
})
