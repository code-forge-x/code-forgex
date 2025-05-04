import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '../../contexts/AuthContext';
import theme from '../../theme';
import RequirementsList from '../../components/user/RequirementsList';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        _id: '1',
        project: {
          name: 'Test Project 1',
          description: 'Test Description 1',
          type: 'web',
          environment: 'development'
        },
        requirements: {
          components: [
            {
              name: 'Component 1',
              type: 'api',
              description: 'Component Description 1'
            }
          ]
        }
      },
      {
        _id: '2',
        project: {
          name: 'Test Project 2',
          description: 'Test Description 2',
          type: 'mobile',
          environment: 'production'
        },
        requirements: {
          components: [
            {
              name: 'Component 2',
              type: 'database',
              description: 'Component Description 2'
            }
          ]
        }
      }
    ])
  })
);

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('RequirementsList', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the list correctly', async () => {
    renderWithProviders(<RequirementsList />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    });

    // Check if components are rendered
    expect(screen.getByText('Component 1')).toBeInTheDocument();
    expect(screen.getByText('Component 2')).toBeInTheDocument();
  });

  it('handles loading state correctly', () => {
    renderWithProviders(<RequirementsList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    // Mock a failed fetch request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })
    );

    renderWithProviders(<RequirementsList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch requirements')).toBeInTheDocument();
    });
  });

  it('opens and closes the edit dialog', async () => {
    renderWithProviders(<RequirementsList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByTestId('EditIcon')[0];
    fireEvent.click(editButton);

    // Check if dialog is open
    expect(screen.getByText('Edit Requirement')).toBeInTheDocument();

    // Close dialog
    fireEvent.click(screen.getByText('Close'));

    // Check if dialog is closed
    expect(screen.queryByText('Edit Requirement')).not.toBeInTheDocument();
  });

  it('deletes a requirement', async () => {
    // Mock successful delete request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    renderWithProviders(<RequirementsList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getAllByTestId('DeleteIcon')[0];
    fireEvent.click(deleteButton);

    // Wait for the requirement to be removed
    await waitFor(() => {
      expect(screen.queryByText('Test Project 1')).not.toBeInTheDocument();
    });
  });

  it('handles edit submission', async () => {
    // Mock successful update request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          _id: '1',
          project: {
            name: 'Updated Project',
            description: 'Updated Description',
            type: 'web',
            environment: 'development'
          },
          requirements: {
            components: [
              {
                name: 'Component 1',
                type: 'api',
                description: 'Component Description 1'
              }
            ]
          }
        })
      })
    );

    renderWithProviders(<RequirementsList />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getAllByTestId('EditIcon')[0];
    fireEvent.click(editButton);

    // Update project name
    const nameInput = screen.getByLabelText('Project Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Project' } });

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Wait for the update to be reflected
    await waitFor(() => {
      expect(screen.getByText('Updated Project')).toBeInTheDocument();
    });
  });
});