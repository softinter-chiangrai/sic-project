import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SicContainer } from './sic-container';

describe('SicContainer', () => {
  let component: SicContainer;
  let fixture: ComponentFixture<SicContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SicContainer]
    }).compileComponents();

    fixture = TestBed.createComponent(SicContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Flexbox Properties', () => {
    it('should apply flex-direction', () => {
      component.flexDirection = 'column';
      const style = component.containerStyle;
      expect(style['flex-direction']).toBe('column');
    });

    it('should apply flex-wrap', () => {
      component.flexWrap = 'wrap';
      const style = component.containerStyle;
      expect(style['flex-wrap']).toBe('wrap');
    });

    it('should apply flex-grow', () => {
      component.flexGrow = 2;
      const style = component.containerStyle;
      expect(style['flex-grow']).toBe(2);
    });

    it('should apply flex-shrink', () => {
      component.flexShrink = 0.5;
      const style = component.containerStyle;
      expect(style['flex-shrink']).toBe(0.5);
    });

    it('should apply order', () => {
      component.order = 3;
      const style = component.containerStyle;
      expect(style['order']).toBe(3);
    });

    it('should apply flex-basis', () => {
      component.flexBasis = 200;
      const style = component.containerStyle;
      expect(style['flex-basis']).toBe('200px');
    });

    it('should apply flex', () => {
      component.flex = '1 1 auto';
      const style = component.containerStyle;
      expect(style['flex']).toBe('1 1 auto');
    });
  });

  describe('Grid Properties', () => {
    beforeEach(() => {
      component.display = 'grid';
    });

    it('should apply grid-template-columns', () => {
      component.gridTemplateColumns = '1fr 2fr 1fr';
      const style = component.containerStyle;
      expect(style['grid-template-columns']).toBe('1fr 2fr 1fr');
    });

    it('should apply grid-template-rows', () => {
      component.gridTemplateRows = 'auto 1fr auto';
      const style = component.containerStyle;
      expect(style['grid-template-rows']).toBe('auto 1fr auto');
    });

    it('should apply grid-column', () => {
      component.gridColumn = '1 / 3';
      const style = component.containerStyle;
      expect(style['grid-column']).toBe('1 / 3');
    });

    it('should apply grid-row', () => {
      component.gridRow = '1 / 2';
      const style = component.containerStyle;
      expect(style['grid-row']).toBe('1 / 2');
    });

    it('should apply grid-auto-flow', () => {
      component.gridAutoFlow = 'column';
      const style = component.containerStyle;
      expect(style['grid-auto-flow']).toBe('column');
    });

    it('should apply grid-auto-columns', () => {
      component.gridAutoColumns = 'minmax(100px, 1fr)';
      const style = component.containerStyle;
      expect(style['grid-auto-columns']).toBe('minmax(100px, 1fr)');
    });

    it('should apply grid-auto-rows', () => {
      component.gridAutoRows = '100px';
      const style = component.containerStyle;
      expect(style['grid-auto-rows']).toBe('100px');
    });
  });

  describe('Gap Properties', () => {
    it('should apply gap', () => {
      component.gap = 16;
      const style = component.containerStyle;
      expect(style['gap']).toBe('16px');
    });

    it('should apply column-gap', () => {
      component.columnGap = '1rem';
      const style = component.containerStyle;
      expect(style['column-gap']).toBe('1rem');
    });

    it('should apply row-gap', () => {
      component.rowGap = 20;
      const style = component.containerStyle;
      expect(style['row-gap']).toBe('20px');
    });
  });

  describe('Alignment Properties', () => {
    it('should apply justify-content', () => {
      component.justifyContent = 'center';
      const style = component.containerStyle;
      expect(style['justify-content']).toBe('center');
    });

    it('should apply justify-items', () => {
      component.justifyItems = 'center';
      const style = component.containerStyle;
      expect(style['justify-items']).toBe('center');
    });

    it('should apply justify-self', () => {
      component.justifySelf = 'end';
      const style = component.containerStyle;
      expect(style['justify-self']).toBe('end');
    });

    it('should apply align-content', () => {
      component.alignContent = 'center';
      const style = component.containerStyle;
      expect(style['align-content']).toBe('center');
    });

    it('should apply align-items', () => {
      component.alignItems = 'flex-start';
      const style = component.containerStyle;
      expect(style['align-items']).toBe('flex-start');
    });

    it('should apply align-self', () => {
      component.alignSelf = 'center';
      const style = component.containerStyle;
      expect(style['align-self']).toBe('center');
    });

    it('should apply place-content', () => {
      component.placeContent = 'center';
      const style = component.containerStyle;
      expect(style['place-content']).toBe('center');
    });

    it('should apply place-items', () => {
      component.placeItems = 'center';
      const style = component.containerStyle;
      expect(style['place-items']).toBe('center');
    });

    it('should apply place-self', () => {
      component.placeSelf = 'center';
      const style = component.containerStyle;
      expect(style['place-self']).toBe('center');
    });
  });

  describe('Dimension Properties', () => {
    it('should apply width', () => {
      component.width = 100;
      const style = component.containerStyle;
      expect(style['width']).toBe('100px');
    });

    it('should apply height', () => {
      component.height = '100%';
      const style = component.containerStyle;
      expect(style['height']).toBe('100%');
    });

    it('should apply min-width', () => {
      component.minWidth = 50;
      const style = component.containerStyle;
      expect(style['min-width']).toBe('50px');
    });

    it('should apply max-width', () => {
      component.maxWidth = 500;
      const style = component.containerStyle;
      expect(style['max-width']).toBe('500px');
    });
  });

  describe('Spacing Properties', () => {
    it('should apply padding', () => {
      component.padding = 16;
      const style = component.containerStyle;
      expect(style['padding']).toBe('16px');
    });

    it('should apply margin', () => {
      component.margin = 8;
      const style = component.containerStyle;
      expect(style['margin']).toBe('8px');
    });
  });

  describe('Style Properties', () => {
    it('should apply backgroundColor', () => {
      component.backgroundColor = '#ff0000';
      const style = component.containerStyle;
      expect(style['background-color']).toBe('#ff0000');
    });

    it('should apply border', () => {
      component.border = '1px solid #000';
      const style = component.containerStyle;
      expect(style['border']).toBe('1px solid #000');
    });

    it('should apply borderRadius', () => {
      component.borderRadius = 8;
      const style = component.containerStyle;
      expect(style['border-radius']).toBe('8px');
    });

    it('should apply boxShadow', () => {
      component.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      const style = component.containerStyle;
      expect(style['box-shadow']).toBe('0 2px 4px rgba(0,0,0,0.1)');
    });
  });

  describe('formatValue', () => {
    it('should add px for number values', () => {
      component.width = 100;
      const style = component.containerStyle;
      expect(style['width']).toBe('100px');
    });

    it('should keep string values unchanged', () => {
      component.width = '50%';
      const style = component.containerStyle;
      expect(style['width']).toBe('50%');
    });
  });
});
