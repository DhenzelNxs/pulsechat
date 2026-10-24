import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import * as authApi from '../../src/api/auth';

function renderProtected() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>Protected content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects to /login when there is no session', async () => {
    vi.spyOn(authApi, 'refreshAccessToken').mockRejectedValue(new Error('no session'));

    renderProtected();

    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected content when a session exists', async () => {
    vi.spyOn(authApi, 'refreshAccessToken').mockResolvedValue({ accessToken: 'token' });
    vi.spyOn(authApi, 'fetchCurrentUser').mockResolvedValue({
      user: {
        _id: '1',
        username: 'alice',
        email: 'alice@example.com',
        status: 'online',
        lastSeenAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    });

    renderProtected();

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });
});
