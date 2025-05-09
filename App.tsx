import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';
import * as RNIap from 'react-native-iap';

const itemSkus = Platform.select({
  android: ['com.myapp.monthly_699'],
  ios: ['com.myapp.monthly_699'], // 👈 Add your actual iOS product ID here if different
});

const App: React.FC = () => {
  const [products, setProducts] = useState<RNIap.Subscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        console.log('Connected to store ✅');

        const subs = await RNIap.getSubscriptions({ skus: itemSkus || [] });
        console.log('Available subscriptions:', subs);
        setProducts(subs);
      } catch (err) {
        console.warn('IAP error', err);
        Alert.alert('Error', 'Failed to connect to billing service.');
      } finally {
        setLoading(false);
      }
    };

    initIAP();
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const requestSubscription = async (sku: string) => {
    try {
      await RNIap.requestSubscription({ sku });
    } catch (error: any) {
      console.warn('Purchase error', error);
      Alert.alert('Error', 'Failed to start purchase flow.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IAP Demo - Subscription Tester</Text>
      <Text style={styles.subtitle}>Welcome to your test app for in-app purchases!</Text>

      {loading && <Text>🔄 Loading subscriptions from {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}...</Text>}

      {!loading && products.length === 0 && (
        <View style={styles.messageBox}>
          <Text style={styles.warning}>⚠️ No subscriptions available</Text>
          <Text style={styles.note}>
            This usually happens when:
            {'\n'}- The product is not approved yet
            {'\n'}- The store is still syncing
            {'\n'}- Your SKU is incorrect
          </Text>
        </View>
      )}

      {!loading &&
        products.map((product) => {
          const formattedPrice =
            Platform.OS === 'android'
              ? (product as RNIap.SubscriptionAndroid)
                  ?.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]
                  ?.formattedPrice ?? '₹--'
              : (product as RNIap.SubscriptionIOS)?.localizedPrice ?? '$--';

          return (
            <View key={product.productId} style={styles.productBox}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text>{product.description}</Text>
              <Text style={styles.price}>{formattedPrice}</Text>
              <Button title="Buy Subscription" onPress={() => requestSubscription(product.productId)} />
            </View>
          );
        })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#444', marginBottom: 20, textAlign: 'center' },
  productBox: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    width: '100%',
  },
  productTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  price: { fontSize: 14, color: 'green', marginTop: 8 },
  messageBox: { marginTop: 20, alignItems: 'center' },
  warning: { fontSize: 16, fontWeight: 'bold', color: 'red' },
  note: { fontSize: 13, color: '#555', marginTop: 6, textAlign: 'center' },
});

export default App;
