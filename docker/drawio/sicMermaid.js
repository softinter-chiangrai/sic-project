/**
 * draw.io plugin: lets the host page insert Mermaid using draw.io's own Mermaid converter.
 * Host -> plugin : {sicAction:'mermaid', mermaid, mode:'replace'|'merge', id}
 * Plugin -> host : {event:'sicMermaid', stage:'inserted'|'parsed'|'error', id, xml?, message?}
 *   replace: converted graph replaces the open diagram (stage 'inserted')
 *   merge  : nothing is inserted, converted graph XML is returned (stage 'parsed') so the host can send {action:'merge', xml}
 */
Draw.loadPlugin(function (ui) {
  function reply(o) {
    window.parent.postMessage(JSON.stringify(Object.assign({ event: 'sicMermaid' }, o)), '*');
  }

  window.addEventListener('message', function (evt) {
    if (evt.source !== window.parent) return;
    var d;
    try {
      d = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
    } catch (e) {
      return;
    }
    if (!d || d.sicAction !== 'mermaid') return;

    try {
      ui.parseMermaidDiagram(d.mermaid, mxUtils.clone(EditorUi.getInsertMermaidConfig()), function (xml) {
        try {
          if (d.mode === 'merge') {
            reply({ stage: 'parsed', id: d.id, xml: String(xml) });
            return;
          }
          ui.editor.setGraphXml(mxUtils.parseXml(String(xml)).documentElement);
          reply({ stage: 'inserted', id: d.id });
        } catch (e) {
          reply({ stage: 'error', id: d.id, message: String(e) });
        }
      }, function (err) {
        reply({ stage: 'error', id: d.id, message: String((err && err.message) || err) });
      });
    } catch (e) {
      reply({ stage: 'error', id: d.id, message: String(e) });
    }
  });
});
