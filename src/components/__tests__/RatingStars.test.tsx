import React from 'react';
import { render } from '@testing-library/react-native';
import { RatingStars } from '../RatingStars';

// Mock MaterialCommunityIcons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name, size, color }: any) => {
    const MockIcon = require('react-native').Text;
    return <MockIcon testID={`icon-${name}`}>{name}</MockIcon>;
  },
}));

describe('RatingStars', () => {
  it('deve renderizar corretamente', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={4.5} />);
    const container = UNSAFE_getAllByType(require('react-native').View);
    expect(container.length).toBeGreaterThan(0);
  });

  it('deve renderizar 5 estrelas por padrão', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={3.5} size={20} />);
    const icons = UNSAFE_getAllByType(require('react-native').Text);
    const starIcons = icons.filter((icon: any) => icon.props.testID?.includes('icon-star'));
    expect(starIcons.length).toBe(5);
  });

  it('deve renderizar rating 0 corretamente', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={0} />);
    const container = UNSAFE_getAllByType(require('react-native').View);
    expect(container.length).toBeGreaterThan(0);
  });

  it('deve renderizar rating máximo corretamente', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={5} />);
    const container = UNSAFE_getAllByType(require('react-native').View);
    expect(container.length).toBeGreaterThan(0);
  });

  it('deve aceitar tamanho customizado', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={4} size={30} />);
    const container = UNSAFE_getAllByType(require('react-native').View);
    expect(container.length).toBeGreaterThan(0);
  });

  it('deve aceitar max customizado', () => {
    const { UNSAFE_getAllByType } = render(<RatingStars rating={4} max={10} />);
    const icons = UNSAFE_getAllByType(require('react-native').Text);
    const starIcons = icons.filter((icon: any) => icon.props.testID?.includes('icon-star'));
    expect(starIcons.length).toBe(10);
  });
});

