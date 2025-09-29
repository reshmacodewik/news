import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import styles from '../style/EditProfileStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { navigate } from '../Navigators/utils';
const BACK_ARROW = require('../icons/back.png');
const EditProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('Alex John');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
   const handleBackPress = () => {
    navigate('Home'); // Replace 'Home' with your actual previous screen name
    console.log('Back pressed');
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.9,
      },
      (response) => {
        if (response?.assets?.[0]?.uri) {
          setImageUri(response.assets[0].uri);
        }
      }
    );
  };

  const handleSave = () => {
    // TODO: Plug into your API
    const payload = { name, email, phone, imageUri };
    console.log('Save profile', payload);
  };

  return (
    <View style={styles.container}>
    <View style={{ height: insets.top }} />
       <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Image source={BACK_ARROW} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
    
        {/* Avatar */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <View style={styles.avatarWrap}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                 <Image source={require('../icons/user.png')} style={styles.userIcon} />
              )}

              {/* camera badge */}
              <View style={styles.cameraBadge}>
                <Image source={require('../icons/camera.png')} style={styles.cameraIcon} />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>{name || ' '}</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>PROFESSIONAL INFORMATION</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#8892a6"
            style={styles.input}
            returnKeyType="next"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Example@email.com"
            placeholderTextColor="#8892a6"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="next"
          />

          <Text style={styles.label}>Phone No</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="98-888-999"
            placeholderTextColor="#8892a6"
            keyboardType="phone-pad"
            style={styles.input}
            returnKeyType="done"
          />
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
