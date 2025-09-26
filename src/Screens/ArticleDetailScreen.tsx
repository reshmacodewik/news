import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../style/ArticleDetailStyles';

const HERO   = require('../icons/news.png');           // hero image
const BACK   = require('../icons/back.png');           // left arrow
// const LIKE   = require('../../icons/heart.png');
// const CHAT   = require('../../icons/chat.png');
// const SHARE  = require('../../icons/share.png');
// const SAVE   = require('../../icons/bookmark.png');

const CATEGORIES = ['All', 'World', 'Business', 'Politics', 'Tech', 'Health', 'Sports'];

type Props = { navigation: any };

const ArticleDetailScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('All');
const scale = (size: number) => (Dimensions.get('window').width / 375) * size;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {/* Safe top spacer */}
      <View style={{ height: insets.top }} />

      {/* ---------- App Bar ---------- */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack?.()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          style={styles.backBtn}
        >
          <Image source={BACK} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.appTitle} numberOfLines={1}>
          Aecalis News
        </Text>
        <View style={{ width: scale(24) }} />{/* balance for centered title */}
      </View>

      {/* ---------- Horizontal categories (scrollable) ---------- */}
      
      {/* ---------- Content ---------- */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + scale(28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <ImageBackground source={HERO} style={styles.hero} imageStyle={styles.heroImg} />

        {/* Headline & byline */}
        <View style={styles.headerBlock}>
          <Text style={styles.headline}>
            Global Trade Tensions Rise as Nations Debate New Tariff Policies
          </Text>

          <Text style={styles.byline}>
            <Text style={styles.byAuthor}>By Davis Lawder</Text>
          </Text>
          <Text style={styles.dateline}>September 13, 2025 4:16 AM</Text>
        </View>

        {/* First paragraphs */}
        <Text style={styles.body}>
          New York, Sept. 12, 2025 — International markets experienced uncertainty today as world
          leaders gathered to discuss potential tariffs on countries accused of unfair trading
          practices. The proposal, raised during a global summit, aims to curb the import of
          discounted commodities and ensure fair competition across industries.
        </Text>

        <Text style={styles.body}>
          According to sources close to the talks, several nations are considering coordinated action
          to address concerns about energy imports from countries facing international sanctions and
          supply constraints.
        </Text>

        {/* Interaction strip */}
        {/* <View style={styles.actionStrip}>
          <TouchableOpacity style={styles.stat}>
            <Image source={LIKE} style={styles.statIcon} />
            <Text style={styles.statText}>37.6K</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={CHAT} style={styles.statIcon} />
            <Text style={styles.statText}>159</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={SHARE} style={styles.statIcon} />
            <Text style={styles.statText}>920</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat}>
            <Image source={SAVE} style={styles.statIcon} />
          </TouchableOpacity>
        </View> */}

        {/* Divider bar */}
        {/* <View style={styles.smallIndicator} /> */}

        {/* Remaining paragraphs */}
        <Text style={styles.body}>
          Analysts predict that the coming weeks will be crucial as discussions continue. A final
          decision is expected before the end of the month, with potential implications for industries
          ranging from energy to technology.
        </Text>

        <Text style={styles.body}>
          Local businesses and consumers are advised to monitor developments closely, as any changes
          could impact fuel costs, trade relations, and overall economic stability.
        </Text>

        {/* Quote block */}
        <View style={styles.quoteWrap}>
          <View style={styles.quoteBar} />
          <Text style={styles.quoteText}>
            “Our goal is not to punish nations unfairly,” said one senior U.S. diplomat during a press
            briefing. “However, we must ensure that no country benefits economically from practices
            that violate international sanctions and threaten global security.”
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ArticleDetailScreen;
