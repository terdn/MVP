import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SubscriptionScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectStandard = () => {
    setSelectedPlan('standard');
  };

  const handleSelectPremium = () => {
    setSelectedPlan('premium');
  };

  const handleContinue = () => {
    if (selectedPlan === 'standard' || selectedPlan === 'premium') {
      // User selected a plan - navigate back to welcome or handle subscription
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'standard' && styles.planCardSelected,
            ]}
            onPress={handleSelectStandard}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.planName,
                selectedPlan === 'standard' && styles.planNameSelected,
              ]}
            >
              STANDARD
            </Text>
            <Text
              style={[
                styles.planPrice,
                selectedPlan === 'standard' && styles.planPriceSelected,
              ]}
            >
              $9.99/month
            </Text>
            <View style={styles.featuresContainer}>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'standard' && styles.featureSelected,
                ]}
              >
                • Makeup & skincare guidance
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'standard' && styles.featureSelected,
                ]}
              >
                • Brand-free product recommendations
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'standard' && styles.featureSelected,
                ]}
              >
                • Progress tracking
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'standard' && styles.featureSelected,
                ]}
              >
                • Saved history
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'premium' && styles.planCardSelected,
            ]}
            onPress={handleSelectPremium}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.planName,
                selectedPlan === 'premium' && styles.planNameSelected,
              ]}
            >
              PREMIUM
            </Text>
            <Text
              style={[
                styles.planPrice,
                selectedPlan === 'premium' && styles.planPriceSelected,
              ]}
            >
              $19.99/month
            </Text>
            <View style={styles.featuresContainer}>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Everything in Standard
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Wrapped (monthly / seasonal insights)
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Advanced analysis depth
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Personalized tone & color refinement
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Priority AI processing
              </Text>
              <Text
                style={[
                  styles.feature,
                  selectedPlan === 'premium' && styles.featureSelected,
                ]}
              >
                • Early access to future physical product collaborations
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedPlan && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedPlan}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Not medical advice. Photos are deleted after analysis.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#000000',
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: 40,
  },
  planCard: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  planCardSelected: {
    backgroundColor: '#000000',
  },
  planName: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 3,
    color: '#000000',
    marginBottom: 8,
  },
  planNameSelected: {
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#000000',
    marginBottom: 16,
  },
  planPriceSelected: {
    color: '#FFFFFF',
  },
  featuresContainer: {
    marginTop: 8,
  },
  feature: {
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: 6,
  },
  featureSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  continueButtonDisabled: {
    opacity: 0.3,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 3,
    color: '#000000',
  },
  disclaimer: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 0.5,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
});
