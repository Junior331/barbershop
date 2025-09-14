import { render, screen } from '@testing-library/react';
import { Avatar } from './index';
import { useAuth } from '@/context/AuthContext';
import { useAvatar } from '@/hooks/useAvatar';

// Mock the hooks
vi.mock('@/context/AuthContext');
vi.mock('@/hooks/useAvatar');

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseAvatar = useAvatar as ReturnType<typeof vi.fn>;

describe('Avatar', () => {
  beforeEach(() => {
    mockUseAvatar.mockReturnValue('https://example.com/avatar.png');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render avatar with user name', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com' }
    });

    render(<Avatar />);

    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'Avatar de John Doe');
  });

  it('should render avatar with email username when name is not available', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'john@example.com' }
    });

    render(<Avatar />);

    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'Avatar de john');
  });

  it('should render avatar with fallback when no user data', () => {
    mockUseAuth.mockReturnValue({
      user: null
    });

    render(<Avatar />);

    const avatar = screen.getByRole('img');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'Avatar de ?');
  });

  it('should show loading spinner initially', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe' }
    });

    render(<Avatar />);

    const spinner = screen.getByText('', { selector: '.loading-spinner' });
    expect(spinner).toBeInTheDocument();
  });

  it('should use user avatarUrl when available', () => {
    const userAvatarUrl = 'https://example.com/user-avatar.jpg';
    mockUseAuth.mockReturnValue({
      user: { name: 'John Doe', avatarUrl: userAvatarUrl }
    });

    render(<Avatar />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', userAvatarUrl);
  });
});