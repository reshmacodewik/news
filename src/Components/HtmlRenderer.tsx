import React from 'react';
import { Dimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';

const { width } = Dimensions.get('window');

interface HtmlRendererProps {
  html?: string;
  limit?: number; // character limit
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ html = '', limit }) => {
  let safeHtml = html.trim();

  if (!safeHtml.startsWith('<')) {
    safeHtml = `<p>${safeHtml}</p>`;
  }

  // Apply text limit
  if (limit && safeHtml) {
    const plainText = safeHtml.replace(/<[^>]+>/g, '');
    const truncated =
      plainText.length > limit
        ? plainText.substring(0, limit) + '...'
        : plainText;
    safeHtml = `<p>${truncated}</p>`;
  }

  return (
    <RenderHTML
      contentWidth={width}
      source={{ html: safeHtml }}
      defaultTextProps={{
        numberOfLines: 2, // limit lines
        ellipsizeMode: 'tail',
      }}
    />
  );
};

export default HtmlRenderer;
