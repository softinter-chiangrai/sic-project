import { buildRefinePrompt } from './ai-prompt-refine.util';

describe('buildRefinePrompt', () => {
  const fields = [{ label: 'ชื่อ', value: 'ระบบเดิม' }];

  it('outside overwrite mode the user prompt is returned trimmed, untouched by the fields', () => {
    expect(buildRefinePrompt('  สร้างใหม่  ', fields, false)).toBe('สร้างใหม่');
  });

  it('an empty prompt outside overwrite mode is undefined', () => {
    expect(buildRefinePrompt('   ', fields, false)).toBeUndefined();
    expect(buildRefinePrompt(null, fields, false)).toBeUndefined();
  });

  it('overwrite mode with nothing to refine falls back to the user prompt', () => {
    expect(buildRefinePrompt('แก้', [], true)).toBe('แก้');
    expect(buildRefinePrompt('แก้', [{ label: 'a', value: '<p></p>' }, { label: 'b', value: '  ' }, { label: 'c', value: null }], true)).toBe('แก้');
  });

  it('overwrite mode quotes every populated field and keeps the user instruction', () => {
    const p = buildRefinePrompt('เพิ่มรายละเอียด', [...fields, { label: 'ว่าง', value: '<p> </p>' }, { label: 'รายละเอียด', value: '<p>เดิม</p>' }], true)!;
    expect(p).toContain('เพิ่มรายละเอียด');
    expect(p).toContain('- ชื่อ: ระบบเดิม');
    expect(p).toContain('- รายละเอียด: <p>เดิม</p>');
    expect(p).not.toContain('- ว่าง:');
  });

  it('overwrite mode without a user prompt still asks for a refinement', () => {
    expect(buildRefinePrompt('', fields, true)).toContain('ช่วยตรวจสอบ ปรับปรุง');
  });
});
