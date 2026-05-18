<#macro mktLogoImage>
  <div class="mkt-logo flex-none">
    <#if properties.logo="file">
      <img class="mkt-logo-img" src="${url.resourcesPath}/${properties.logoUri}" alt="${properties.logoDesc}" />
    <#else>
      <img class="mkt-logo-img" src="${properties.logoUri}" alt="${properties.logoDesc}" />
    </#if>
  </div>
</#macro>

<#macro kw>
  <div class="font-bold text-center text-2xl">
    <#if properties.logo="off">
      <#nested>
    <#else>
      <div class="mkt-logo-wrapper flex justify-center items-center">
        <#switch properties.logoDisp>
          <#case "left">
            <@mktLogoImage />
            <#nested>
            <#break>
          <#case "right">
            <#nested>
            <@mktLogoImage />
            <#break>
          <#case "replace">
            <@mktLogoImage />
            <#break>
          <#default>
            <div>Your icon config is not correct</div>
        </#switch>
      </div>
    </#if>
  </div>
</#macro>
