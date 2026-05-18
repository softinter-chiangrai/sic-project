<#macro kw>
  <div class="wave-animation"></div>
  <#if properties.wave="on">
  <script>
    if (CSS.paintWorklet) {
      CSS.paintWorklet.addModule("${url.resourcesPath}/animation.js")
    }

    const wave = document.querySelector('.wave-animation')
    let height = 1 - Number(${ properties.waveHeight })
    if (height < 0) height = 0
    if (height > 1) height = 1
    wave.style.setProperty('--amplitude', '${properties.waveAmplitude}')
    wave.style.setProperty('--gap', '${properties.waveGap}')
    wave.style.setProperty('--height', height)
    wave.style.setProperty('--speed', '${properties.waveSpeed}s')
    wave.style.setProperty('--layer1color', '${properties.waveColor}')
    wave.style.setProperty('--layer2color', '${properties.waveColor}')
    wave.style.setProperty('--layer3color', '${properties.waveColor}')

    <#if properties.waveFollowCursor="on">
    let timer
    let lastRatio = height
    document.addEventListener('mousemove', (event) => {
      if (timer) return
      timer = setTimeout(() => {
        const y = event.clientY
        let ratio = Math.floor(y / window.innerHeight * 10)
        ratio = (ratio % 2 === 0 ? ratio + 1 : ratio) / 10
        if (lastRatio !== ratio) {
          wave.style.setProperty('--height', ratio)
          lastRatio = ratio
        }
        timer = null
      }, 40)
    });
    </#if>
  </script>
  </#if>
</#macro>
