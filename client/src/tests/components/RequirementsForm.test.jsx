import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '../../contexts/AuthContext';
import theme from '../../theme';
import RequirementsForm from '../../components/user/RequirementsForm';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true })
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

describe('RequirementsForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders the form correctly', () => {
    renderWithProviders(<RequirementsForm />);
    
    expect(screen.getByText('Project Requirements')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Project Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Environment')).toBeInTheDocument();
    expect(screen.getByText('Add Component')).toBeInTheDocument();
  });

  it('handles project details input correctly', () => {
    renderWithProviders(<RequirementsForm />);
    
    const nameInput = screen.getByLabelText('Project Name');
    const descriptionInput = screen.getByLabelText('Description');
    const typeInput = screen.getByLabelText('Project Type');
    const environmentInput = screen.getByLabelText('Environment');

    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(typeInput, { target: { value: 'web' } });
    fireEvent.change(environmentInput, { target: { value: 'development' } });

    expect(nameInput.value).toBe('Test Project');
    expect(descriptionInput.value).toBe('Test Description');
    expect(typeInput.value).toBe('web');
    expect(environmentInput.value).toBe('development');
  });

  it('adds and removes components correctly', () => {
    renderWithProviders(<RequirementsForm />);
    
    // Add a component
    fireEvent.click(screen.getByText('Add Component'));
    
    const componentNameInput = screen.getByLabelText('Name');
    const componentTypeInput = screen.getByLabelText('Type');
    const componentDescriptionInput = screen.getByLabelText('Description');

    fireEvent.change(componentNameInput, { target: { value: 'Test Component' } });
    fireEvent.change(componentTypeInput, { target: { value: 'api' } });
    fireEvent.change(componentDescriptionInput, { target: { value: 'Test Component Description' } });

    fireEvent.click(screen.getByText('Add Component'));

    // Verify component was added
    expect(screen.getByText('Test Component')).toBeInTheDocument();

    // Remove the component
    const deleteButton = screen.getByTestId('DeleteIcon');
    fireEvent.click(deleteButton);

    // Verify component was removed
    expect(screen.queryByText('Test Component')).not.toBeInTheDocument();
  });

  it('submits the form correctly', async () => {
    renderWithProviders(<RequirementsForm />);
    
    // Fill in project details
    fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Project Type'), { target: { value: 'web' } });
    fireEvent.change(screen.getByLabelText('Environment'), { target: { value: 'development' } });

    // Add a component
    fireEvent.click(screen.getByText('Add Component'));
    
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Component' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'api' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Component Description' } });

    fireEvent.click(screen.getByText('Add Component'));

    // Submit the form
    fireEvent.click(screen.getByText('Submit Requirements'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        '/api/requirements/collect',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.any(String)
          })
        })
      );
    });
  });

  it('handles form submission errors', async () => {
    // Mock a failed fetch request
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      })
    );

    renderWithProviders(<RequirementsForm />);
    
    // Fill in project details
    fireEvent.change(screen.getByLabelText('Project Name'), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Project Type'), { target: { value: 'web' } });
    fireEvent.change(screen.getByLabelText('Environment'), { target: { value: 'development' } });

    // Add a component
    fireEvent.click(screen.getByText('Add Component'));
    
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test Component' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'api' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Component Description' } });

    fireEvent.click(screen.getByText('Add Component'));

    // Submit the form
    fireEvent.click(screen.getByText('Submit Requirements'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit requirements')).toBeInTheDocument();
    });
  });
});