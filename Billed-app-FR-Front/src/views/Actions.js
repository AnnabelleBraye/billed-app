import eyeBlueIcon from "../assets/svg/eye_blue.js"
import downloadBlueIcon from "../assets/svg/download_blue.js"

export default (fileUrl, id) => {
  return (
    `<div class="icon-actions">
      <div id="eye" data-testid='eye-${id}' data-bill-url='${fileUrl}'>
      ${eyeBlueIcon}
      </div>
    </div>`
  )
}