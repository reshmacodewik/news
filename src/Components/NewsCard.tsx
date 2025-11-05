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

  /** 👇 NEW: show badge only when you want (e.g., PremiumOnlyScreen) */
  showPremiumBadge?: boolean;
  badgeLabel?: string;
};

const NewsCard: React.FC<Props> = ({
  category,
  title,
  description = '',
  image,
  commentCount = 0,
  viewCount = 0,
  onPress,
  showPremiumBadge = false,
  badgeLabel = 'PREMIUM',
}) => {
  const { theme, colors } = useTheme();

  const formattedCategory =
    category?.charAt(0)?.toUpperCase() + category?.slice(1)?.toLowerCase();

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
        {/* Category + optional badge */}
        <View style={styles.catRow}>
          <Text style={[styles.categoryText, { color: colors.headingtext }]}>
            {formattedCategory}
          </Text>

          {showPremiumBadge && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>{badgeLabel}</Text>
            </View>
          )}
        </View>

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
  /** row for category + badge */
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(2),
  },
  categoryText: {
    color: '#004EEB',
    fontWeight: '600',
    fontSize: scale(13),
    textTransform: 'capitalize',
  },
  /** PREMIUM pill */
  premiumBadge: {
    paddingHorizontal: scale(6),
    paddingVertical: scale(2),
    borderRadius: scale(6),
    backgroundColor: '#E8F0FF', // soft blue bg
  },
  premiumText: {
    fontSize: scale(10),
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#1E40AF', // deep blue
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
