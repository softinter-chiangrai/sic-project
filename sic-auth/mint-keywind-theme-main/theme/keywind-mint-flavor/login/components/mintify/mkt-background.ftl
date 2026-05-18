<#import "fx-wave.ftl" as wave>

<#macro kw>
  <div class="mkt-bg absolute top-0 left-0 w-screen h-screen">

  <#switch properties.bg>
    <#case "off">
    <#case "file">
    <#case "internet">
    <#case "solid">
    <#case "gradient">
      <div class="hidden p-[8px] text-[18px] text-white italic drop-shadow-[1px_1px_3px_#333]">background is ${properties.bg}</div>
      <#break>
    <#case "wave">
      <@wave.kw />
      <#break>
    <#default>
      <div class="p-[8px] text-[18px] text-[#f5222d] font-bold drop-shadow-[0_0_5px_#555]">Your background type setting is incorrect!</div>
  </#switch>

  </div>
</#macro>
