<#macro kw>
  <#if properties.formWrap="full-width">
  <#-- * Full-Width mode  -->
  <div class="w-full h-[100vh] overflow-hidden">
    <div class="mkt-form h-full max-w-md flex flex-col justify-center relative">
      <div class="mkt-form-wrap absolute top-[50%] left-[50%]">
        <div class="mkt-form-wrap-ext absolute top-0 h-full"></div>
      </div>
      <div class="mkt-form-login space-y-6"><#nested></div>
    </div>
  </div>
  <script>
    function throttle (func, delay = 10) {
      let timer = null
      return function () {
        if (!timer) {
          func.apply(this, arguments)
          timer = setTimeout(() => { timer = null }, delay)
        }
      }
    }
    function updateWrapSize () {
      const screenW = screen.width
      const screenH = screen.height
      const diagonal = Math.ceil(Math.sqrt(Math.pow(screenW, 2) + Math.pow(screenH, 2)))
      const elWrapper = document.querySelector(".mkt-form-wrap")
      elWrapper.style.height = diagonal + "px"

      <#if properties.formPos!="center" && properties.formWrap2Edge="on" >
      const elWrapperExt = document.querySelector(".mkt-form-wrap-ext")
      elWrapperExt.style.width=screenW + "px"
        <#if properties.formPos="right">
      elWrapperExt.style.left="50%"
        <#elseif properties.formPos="left">
      elWrapperExt.style.right="50%"
        <#else>
      elWrapperExt.style.width="0" // Prevent abnormal behavior.
        </#if>
      </#if >
    }
    updateWrapSize()
    window.addEventListener("resize", throttle(updateWrapSize))
  </script>
  <#else>
  <#-- * Default Keywind mode  -->
  <div class="w-full h-full overflow-hidden">
    <div class="mkt-form h-full max-w-md flex flex-col justify-center relative">
      <div class="mkt-form-wrap absolute top-[50%] left-[50%]"></div>
      <div class="mkt-form-login space-y-6"><#nested></div>
    </div>
  </div>
  </#if>
</#macro>
