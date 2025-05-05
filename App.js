import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Alert,Image,Button } from 'react-native';
import React,{useState,useEffect,useRef} from 'react';

//Novo sistema de camera do Expo SDK51+
import { CameraView,useCameraPermissions } from 'expo-camera';

//Importando a galeria do aparelho
import * as MediaLibrary from 'expo-media-library'

//Importando o Sharing(Compartilhameto da foto tirada)
import * as Sharing from 'expo-sharing';

export default function App() {
  //Estado de permissao da camera
  const[permissaoCam,requestPermissaoCam]=useCameraPermissions()

  //Estado de permissao da galeria
  const[permissaoGaleria,requestPermissaoGaleria]=MediaLibrary.usePermissions()

  //Estado para realizar a referencia direto de um componente
  const cameraRef = useRef(null)

  //Estado para foto capturada
  const[foto,setFoto]=useState(null)

  //Estado para alternar entre as câmeras
  const[isFrontCamera,setIsFrontCamera]=useState(false)

  //Estado para ligar e desativar o flash
  const[flashLigado,setFlashLigado]=useState(false)

  //Estado para saber se o barcode foi ligo pela camera
  const[scaneado,setScaneado]=useState(false)

  //Pedindo permissão galeria no inicio do app
  useEffect(()=>{
    if(!permissaoGaleria) return;
    if(!permissaoGaleria?.granted){
      requestPermissaoGaleria()
    }
  },[])

  //Função para tirar foto
  const tirarFoto = async() =>{
    if(cameraRef.current){
      const dadoFoto = await cameraRef.current.takePictureAsync()//Captura a foto
      setFoto(dadoFoto)
    }
  }

  //Salvar foto na galeria do aparelho
  const salvarFoto = async() =>{
    if(foto?.uri){
      try{
        await MediaLibrary.createAssetAsync(foto.uri)//salva na galeria
        Alert.alert("Sucesso","Foto Salva")
        setFoto(null)//Reseta o estado para tirar uma nova foto

      }catch(error){
        Alert.alert("Error","Não foi possivel salvar a imagem")
      }
    }
  }
  const compartilharFoto = async () =>{
    if(foto?.uri && await Sharing.isAvailableAsync()){
      await Sharing.shareAsync(foto.uri)
    }else{
      Alert.alert("Error",'Compartilhamento não disponível')
    }
  }

  //Função para alterar o Estado do Flash
  const alternarFlash = () =>{
    setFlashLigado(!flashLigado)
  }

  //Enquanto a permissao da camera não foi concedido
  if(!permissaoCam) return <View/>

  //Se a permissao foi negada pelo o usuario
  if(!permissaoCam?.granted){
    <View>
      <Text>Permissão da camera não foi concedida</Text>
      <Button title='Permitir' onPress={requestPermissaoCam}/>
    </View>
  }

  return (
    <View style={styles.container}>
      {!foto?(
        <>
          <CameraView 
            ref={cameraRef}
            style={styles.camera}
            flash={flashLigado?'on':'off'}
            facing={isFrontCamera?'front':'back'} 
            onBarcodeScanned={({type,data})=>{
              if(!scaneado){
                setScaneado(true)
                Alert.alert("Cod Scaneado",`Tipo:${type}\nValor:${data}`)
              }
            }}           
          />
          <Button title='Tirar Foto' onPress={tirarFoto}/>
          <Button title='Alternar Camera' onPress={()=>setIsFrontCamera(!isFrontCamera)}/>
          <Button title={flashLigado?'Desativar Flash':'Ligar Flash'} onPress={alternarFlash}/>
          {scaneado && (
            <Button title='Escanear novamente' onPress={()=>setScaneado(false)}/>
            )}
        </>
      ):(
        <>
          <Image source={{uri:foto.uri}} style={{flex:1}} />
          <Button title='Salvar Foto' onPress={salvarFoto}/>
          <Button title='Tirar outra foto' onPress={()=>setFoto(null)}/>
          <Button title='Compartilhar Foto' onPress={compartilharFoto}/>  
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  camera:{
    flex:1
  }
});
