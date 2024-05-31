import { ImplementationError } from '../../Error';
import { NamespaceDispatcher } from './NamespaceDispatcher';

test('get complains when no NamespaceSourceHandler has been registered', async () => {
  const dispatcher = new NamespaceDispatcher([]);

  try {
    await dispatcher.get('doesntmatter');
  } catch (error) {
    expect(error).toBeInstanceOf(ImplementationError);
  }
});
