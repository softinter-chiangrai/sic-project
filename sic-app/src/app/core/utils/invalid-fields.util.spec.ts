import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { withInvalidFields } from './invalid-fields.util';

describe('withInvalidFields', () => {
  const translate = { instant: (k: string) => (k === 'FIELD_PROJECT_ID' ? 'โครงการ' : k) } as unknown as TranslateService;
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement('div');
    host.innerHTML = `
      <sic-input formcontrolname="projectName"><span class="sic-input__label">ชื่อโครงการ <span class="sic-input__required">*</span></span></sic-input>
      <div><label>วันที่เริ่มต้น</label><input formcontrolname="startDate"></div>`;
    document.body.appendChild(host);
  });
  afterEach(() => host.remove());

  it('lists the label of every empty required field, also the ones not on screen, and marks them touched', () => {
    const form = new FormGroup({
      projectName: new FormControl('', Validators.required),
      startDate: new FormControl(null, Validators.required),
      projectId: new FormControl(null, Validators.required),
      note: new FormControl(''),
    });
    const msg = withInvalidFields('กรุณากรอกข้อมูลให้ครบ', form, translate);
    expect(msg).toBe('กรุณากรอกข้อมูลให้ครบ\n• ชื่อโครงการ\n• วันที่เริ่มต้น\n• โครงการ');
    expect(form.get('projectName')!.touched).toBe(true);
  });

  it('accepts a SicFromData-like wrapper and leaves the message alone when nothing is missing', () => {
    const form = new FormGroup({ projectName: new FormControl('x', Validators.required) });
    expect(withInvalidFields('msg', { form }, translate)).toBe('msg');
  });
});
