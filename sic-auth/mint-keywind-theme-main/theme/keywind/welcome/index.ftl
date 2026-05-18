<!DOCTYPE html>
<html lang="en">
  <head>
    <#if properties.welcomeBehavior="admin">
    <meta http-equiv="refresh" content="0; url=${adminUrl}" />
    <#elseif properties.welcomeBehavior="user">
    <meta http-equiv="refresh" content="0; url=/realms/${properties.defaultRealm}/account/#/applications" />
    </#if>
    <meta name="robots" content="noindex, nofollow" />
    <script type="text/javascript">
      <#if properties.welcomeBehavior="admin">
      var url = '${adminUrl}'
      <#elseif properties.welcomeBehavior="user">
      var url = '/realms/${properties.defaultRealm}/account/#/applications'
      </#if>
      window.location.href = url
      document.addEventListener('DOMContentLoaded', function() { document.querySelector('#welcome-link').href = url })
    </script>
  </head>
  <body>
    If you are not redirect automatically, click <a id="welcome-link" href="${adminUrl}">here</a>.
  </body>
</html>
