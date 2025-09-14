import { render } from '@testing-library/react'
import App from './App'
import { AppRoutes } from './routes'

// Mock the AppRoutes component
vi.mock('./routes', () => ({
  AppRoutes: vi.fn(() => <div data-testid="app-routes">App Routes</div>)
}))

describe('App', () => {
  it('should render AppRoutes', () => {
    const { getByTestId } = render(<App />)

    expect(getByTestId('app-routes')).toBeInTheDocument()
    expect(AppRoutes).toHaveBeenCalled()
  })
})