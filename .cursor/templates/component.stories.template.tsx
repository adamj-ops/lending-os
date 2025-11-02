/**
 * Template for creating Storybook stories
 *
 * Instructions:
 * 1. Copy this template to [ComponentName].stories.tsx next to your component
 * 2. Replace [ComponentName] with your component name
 * 3. Replace [componentName] with lowercase version
 * 4. Update the imports
 * 5. Add variants and use cases
 * 6. Document props in the Args table
 */

import type { Meta, StoryObj } from '@storybook/react';
import { [ComponentName] } from './[componentName]';

const meta = {
  title: 'Components/[Category]/[ComponentName]',
  component: [ComponentName],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Document your props here
    // prop1: {
    //   control: 'text',
    //   description: 'Description of prop1',
    // },
  },
} satisfies Meta<typeof [ComponentName]>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state of the component
 */
export const Default: Story = {
  args: {
    // Add default props
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    error: new Error('Something went wrong'),
  },
};

/**
 * Empty state
 */
export const Empty: Story = {
  args: {
    data: [],
  },
};

/**
 * With data
 */
export const WithData: Story = {
  args: {
    data: [
      { id: '1', name: 'Example 1' },
      { id: '2', name: 'Example 2' },
    ],
  },
};

/**
 * Different variant (if applicable)
 */
export const Variant: Story = {
  args: {
    variant: 'secondary',
  },
};

/**
 * Disabled state (if applicable)
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
