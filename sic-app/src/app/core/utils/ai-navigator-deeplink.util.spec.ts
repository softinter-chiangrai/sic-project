import { ActivatedRoute, Router } from '@angular/router';
import { tryAiAutoOpen } from './ai-navigator-deeplink.util';

function setup(params: Record<string, string>, extra: { canOpen?: () => boolean } = {}) {
  const calls: string[] = [];
  const router = { navigate: vi.fn() } as unknown as Router;
  const route = {} as ActivatedRoute;
  tryAiAutoOpen({
    params, router, route, moduleType: 'requirement', canOpen: extra.canOpen,
    open: () => calls.push('open'), setPrompt: (p) => calls.push(`prompt:${p}`), generate: () => calls.push('generate'),
  });
  return { calls, router };
}

describe('tryAiAutoOpen', () => {
  it('does nothing without the aiAutoOpen flag or for another module', () => {
    expect(setup({ aiModuleType: 'requirement' }).calls).toEqual([]);
    expect(setup({ aiAutoOpen: '1', aiModuleType: 'specification', aiPrompt: 'x' }).calls).toEqual([]);
  });

  it('is blocked when the page says it cannot open (view-only / locked)', () => {
    const { calls, router } = setup({ aiAutoOpen: '1', aiModuleType: 'requirement', aiPrompt: 'x' }, { canOpen: () => false });
    expect(calls).toEqual([]);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('opens BEFORE setting the prompt (open() may reset it), then generates, then clears the params', async () => {
    const { calls, router } = setup({ aiAutoOpen: '1', aiModuleType: 'requirement', aiPrompt: 'ทำระบบ' });
    expect(calls).toEqual(['open', 'prompt:ทำระบบ']);
    await Promise.resolve();
    expect(calls).toEqual(['open', 'prompt:ทำระบบ', 'generate']);
    expect((router.navigate as any).mock.calls[0][1].queryParams).toEqual({ aiAutoOpen: null, aiModuleType: null, aiPrompt: null });
  });

  it('without a prompt it opens but does not generate', async () => {
    const { calls } = setup({ aiAutoOpen: '1', aiModuleType: 'requirement' });
    await Promise.resolve();
    expect(calls).toEqual(['open', 'prompt:']);
  });
});
