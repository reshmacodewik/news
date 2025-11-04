import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const baseW = 375;
const scale = (n: number) => (width / baseW) * n;
const f = (n: number) => Math.round(PixelRatio.roundToNearestPixel(scale(n)));

type Props = {
  category: string;
  title: string;
  description?: string;
  image?: string;
  commentCount?: number;
  viewCount?: number;
  onPress?: () => void;
};

const NewsCard: React.FC<Props> = ({
  category,
  title,
  description = '',
  image,
  commentCount = 0,
  viewCount = 0,
  onPress,
}) => {
  // Capitalize category
  const formattedCategory =
    category?.charAt(0)?.toUpperCase() + category?.slice(1)?.toLowerCase();
 const { theme, colors } = useTheme();
  // Determine view count text
  const viewText = viewCount > 0 ? `${viewCount}+` : '0';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.rowCard, { backgroundColor: colors.card }]}
    >
      {/* Left Image */}
      {image ? (
        <Image source={{ uri: image }} style={styles.rowThumb} />
      ) : (
        <View style={[styles.rowThumb, { backgroundColor: '#DCE3F1' }]} />
      )}

      {/* Right Content */}
      <View style={styles.rowRight}>
        <Text style={[styles.categoryText, { color: colors.headingtext }]}>{formattedCategory}</Text>

        <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={5}>
          {title}
        </Text>

        <Text style={[styles.metaDesc]} numberOfLines={1} ellipsizeMode="tail">
          {(description || '').replace(/<[^>]+>/g, '')}
        </Text>

        {/* Meta Info Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaGroup}>
            <Image
              source={require('../icons/comment.png')}
              style={styles.metaIconImg}
            />
            <Text style={styles.metaText}>{commentCount ?? 0}</Text>
          </View>

          <View style={styles.metaGroup}>
            <Image
              source={require('../icons/eye.png')}
              style={styles.metaIconImg}
            />
            <Text style={styles.metaText}>{viewText}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: scale(16),
    marginBottom: scale(12),
    padding: scale(12),
    marginTop: scale(5),
    backgroundColor: '#EEF5FF',
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#00000026',
  },
  rowThumb: {
    width: scale(95),
    height: scale(105),
    borderRadius: scale(10),
  },
  rowRight: {
    flex: 1,
    marginLeft: scale(12),
    justifyContent: 'center',
  },
  categoryText: {
    color: '#004EEB',
    fontWeight: '600',
    fontSize: scale(13),
    marginBottom: scale(2),
    textTransform: 'capitalize',
  },
  rowTitle: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#0F172A',
  },
  metaDesc: {
    fontSize: scale(13),
    color: '#727272',
    marginTop: scale(3),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginTop: scale(8),
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
  },
  metaIconImg: {
    width: scale(16),
    height: scale(16),
    tintColor: '#727272',
    resizeMode: 'contain',
  },
  metaText: {
    fontSize: scale(13),
    color: '#727272',
  },
});

export default NewsCard;
