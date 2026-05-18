<#macro kw>
  <#if properties.formWrap="full-width">
  <body class="bg-secondary-100 flex flex-col items-center justify-center min-h-screen">
  <#else>
  <body class="bg-secondary-100 flex flex-col items-center justify-center min-h-screen sm:py-16">
  </#if>
    <#nested>
  </body>
</#macro>
