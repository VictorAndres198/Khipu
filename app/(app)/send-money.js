import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import useSafeArea from '../../src/hooks/useSafeArea';
import { globalStyles } from '../../src/styles/GlobalStyles';
import { getCurrentUser } from '../../src/services/firebase/auth';
import { findUserByPhone, sendMoney, listenToUser } from '../../src/services/firebase/firestore';

export default function SendMoney() {
  const { safeAreaInsets } = useSafeArea(true);
  const router = useRouter();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const unsubscribe = listenToUser(user.uid, setUserData);
      return unsubscribe;
    }
  }, []);

  const searchUser = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      Alert.alert('Error', 'Ingresa un número de teléfono válido');
      return;
    }

    setSearching(true);
    try {
      const user = await findUserByPhone(phoneNumber);
      setFoundUser(user);
      
      if (!user) {
        Alert.alert('Usuario no encontrado', 'Verifica el número de teléfono');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo buscar el usuario');
    } finally {
      setSearching(false);
    }
  };

  const handleSendMoney = async () => {
    const user = getCurrentUser();
    if (!user || !foundUser) return;

    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    if (userData?.saldo < numericAmount) {
      Alert.alert('Saldo insuficiente', `Tu saldo es S/ ${userData.saldo.toFixed(2)}`);
      return;
    }

    setSending(true);
    try {
      const result = await sendMoney(
        user.uid, 
        phoneNumber, 
        numericAmount, 
        description || 'Transferencia'
      );

      Alert.alert(
        '✅ Transferencia exitosa',
        `Enviaste S/ ${numericAmount.toFixed(2)} a ${foundUser.nombre}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('❌ Error', error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[globalStyles.container, safeAreaInsets]}>
      <ScrollView 
        style={globalStyles.containerWithPadding}
        contentContainerStyle={globalStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={globalStyles.headerContainerNoPadding}>
          <Text style={globalStyles.title}>Enviar Dinero</Text>
          <Text style={[globalStyles.body, { marginTop: 8 }]}>
            Transfiere dinero a otro usuario de Khipu
          </Text>
        </View>

        {/* Tu saldo actual */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={globalStyles.caption}>Tu saldo disponible</Text>
          <Text style={[globalStyles.title, { color: '#2E86AB', fontSize: 24 }]}>
            S/ {userData?.saldo?.toFixed(2) || '0.00'}
          </Text>
        </View>

        {/* Buscar usuario */}
        <View style={[globalStyles.card, { marginBottom: 24 }]}>
          <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
            Buscar Usuario
          </Text>
          
          <TextInput
            style={globalStyles.input}
            placeholder="Número de teléfono (+51...)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!searching && !sending}
          />

          <TouchableOpacity 
            style={[
              globalStyles.button, 
              globalStyles.buttonPrimary,
              { opacity: (searching || !phoneNumber) ? 0.6 : 1 }
            ]}
            onPress={searchUser}
            disabled={searching || !phoneNumber}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={globalStyles.buttonText}>Buscar Usuario</Text>
            )}
          </TouchableOpacity>

          {/* Resultado de búsqueda */}
          {foundUser && (
            <View style={{ 
              marginTop: 16, 
              padding: 16, 
              backgroundColor: '#E8F5E8', 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#4CAF50'
            }}>
              <Text style={[globalStyles.body, { fontWeight: '600' }]}>
                👤 {foundUser.nombre}
              </Text>
              <Text style={globalStyles.caption}>
                📱 {foundUser.telefono}
              </Text>
            </View>
          )}
        </View>

        {/* Detalles de transferencia */}
        {foundUser && (
          <View style={[globalStyles.card, { marginBottom: 24 }]}>
            <Text style={[globalStyles.subtitle, { marginBottom: 16 }]}>
              Detalles de Transferencia
            </Text>
            
            <TextInput
              style={globalStyles.input}
              placeholder="Monto (S/)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!sending}
            />

            <TextInput
              style={globalStyles.input}
              placeholder="Descripción (opcional)"
              value={description}
              onChangeText={setDescription}
              editable={!sending}
            />

            <TouchableOpacity 
              style={[
                globalStyles.button, 
                globalStyles.buttonPrimary,
                { opacity: (sending || !amount) ? 0.6 : 1 }
              ]}
              onPress={handleSendMoney}
              disabled={sending || !amount}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>
                  Enviar S/ {amount || '0.00'} a {foundUser.nombre.split(' ')[0]}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}