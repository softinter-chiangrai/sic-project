FROM jgraph/drawio:latest

# Mermaid insert plugin (loaded with ?p=sicMermaid)
COPY sicMermaid.js /usr/local/tomcat/webapps/draw/plugins/sicMermaid.js
RUN echo 'App.pluginRegistry.sicMermaid = "plugins/sicMermaid.js";' >> /usr/local/tomcat/webapps/draw/js/PostConfig.js
