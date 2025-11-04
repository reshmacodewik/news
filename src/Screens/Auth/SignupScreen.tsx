import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
} from "react-native";
import { styles } from "../../style/SignupScreenstyles";
import { apiPost } from "../../Utils/api/common";
import { signupSchema } from "../../validation/signupSchema";
import { useFormik } from "formik";
import { API_REGISTER } from "../../Utils/api/APIConstant";
import ShowToast from "../../Utils/ShowToast";
import { goBackNavigation, navigate } from "../../Navigators/utils";
import { AuthSession, useAuth } from "./AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

const SignupScreen = () => {
  const { signIn } = useAuth();
  const { theme, toggleTheme,colors } = useTheme();
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      agreeTerms: false,
      subscribeNews: false,
    },
    validationSchema: signupSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const res = await apiPost({
          url: API_REGISTER,
          values: {
            name: values.name,
            email: values.email,
            password: values.password,
            subscribeNews: values.subscribeNews,
          },
        });

        if (res?.success) {
          const session: AuthSession = {
            accessToken: res.data.token,
            user: {
              id: res.data.id,
              name: res.data.name,
              email: res.data.email,
            },
          };

          // Save session in context and AsyncStorage
          signIn(session);
          await AsyncStorage.setItem("userSession", JSON.stringify(session));

          ShowToast(res.message || "Registered successfully", "success");
          navigate("Home" as never);
        } else {
          ShowToast(res?.message || "Registration failed", "error");
        }
      } catch (error: any) {
        console.log("Signup error:", error);
        ShowToast(error?.message || "Something went wrong", "error");
      } finally {
        setSubmitting(false);
      }
    },
  });
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={require("../../icons/background.png")}
          resizeMode="cover"
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../icons/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Create Your Account</Text>
            <Text style={styles.subtitleText}>
              Sign up to receive breaking news, trending stories, and
              personalized updates.
            </Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="name"
                placeholderTextColor="#9CA3AF"
                value={formik.values.name}
                onChangeText={formik.handleChange("name")}
                onBlur={formik.handleBlur("name")}
              />
              {formik.touched.name && formik.errors.name && (
              <Text style={{ color: "red", fontSize: 12,marginLeft: 10 }}>
                  {formik.errors.name}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="example@email.com"
                placeholderTextColor="#9CA3AF"
                value={formik.values.email}
                onChangeText={formik.handleChange("email")}
                onBlur={formik.handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {formik.touched.email && formik.errors.email && (
               <Text style={{ color: "red", fontSize: 12,marginLeft: 10 }}>
                  {formik.errors.email}
                </Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
              <TextInput
                style={styles.textInput}
                placeholder="enter the password"
                placeholderTextColor="#9CA3AF"
                value={formik.values.password}
                onChangeText={formik.handleChange("password")}
                onBlur={formik.handleBlur("password")}
                secureTextEntry
              />
              {formik.touched.password && formik.errors.password && (
                <Text style={{ color: "red", fontSize: 12,marginLeft: 10 }}>
                  {formik.errors.password}
                </Text>
              )}
            </View>

            {/* --- Checkboxes --- */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                formik.setFieldValue("agreeTerms", !formik.values.agreeTerms)
              }
              style={[styles.checkboxRow, { backgroundColor: colors.background }]}
            >
              <View
                style={[
                  styles.checkboxBox,
                  formik.values.agreeTerms && styles.checkboxBoxChecked,
                ]}
              >
                {formik.values.agreeTerms ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : null}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                I agree to the website’s{" "}
                <Text style={[styles.linkText, { color: colors.text }]}>Terms & Conditions</Text> and{" "}
                <Text style={[styles.linkText, { color: colors.text }]}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>
            {formik.touched.agreeTerms && formik.errors.agreeTerms && (
              <Text style={{ color: "red", fontSize: 12,marginBottom: 10}}>
                {formik.errors.agreeTerms}
              </Text>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                formik.setFieldValue(
                  "subscribeNews",
                  !formik.values.subscribeNews
                )
              }
              style={styles.checkboxRow}
            >
              <View
                style={[
                  styles.checkboxBox,
                  formik.values.subscribeNews && styles.checkboxBoxChecked,
                ]}
              >
                {formik.values.subscribeNews ? (
                  <Text style={styles.checkIcon}>✓</Text>
                ) : null}
              </View>
              <Text style={[styles.checkboxText, { color: colors.text }]}>
                I want to receive newsletters, updates, and personalized news.
              </Text>
            </TouchableOpacity>
            {formik.touched.subscribeNews && formik.errors.subscribeNews && (
              <Text style={{ color: "red", fontSize: 12,marginBottom: 10 }}>
                {formik.errors.subscribeNews}
              </Text>
            )}

            {/* CTA */}
            <TouchableOpacity
              style={[
                styles.signInButton,
                !formik.values.agreeTerms && { opacity: 0.6 },
              ]}
              onPress={formik.handleSubmit as any}
              disabled={!formik.values.agreeTerms || !formik.values.subscribeNews || formik.isSubmitting}
              activeOpacity={0.9}
            >
              <Text style={styles.signInButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Footer link */}
            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: colors.text }]}>
                Already have an account?{" "}
                <Text
                  style={[styles.signUpLink, { color: colors.headingtext }]}
                  onPress={() => goBackNavigation()}
                >
                  Log in
                </Text>
              </Text>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
