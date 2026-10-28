export const useCloudinary = () => {
  const config = useRuntimeConfig()
  const cloud = config.public.cloudinaryCloudName || 'demo'
  const image = (publicId:string, width=800) => `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_${width},c_fill,g_auto/courtlink/${publicId}.jpg`
  const avatar = (index:number) => `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_240,h_240,c_fill,g_auto/courtlink/avatars/player-${(index%8)+1}.jpg`
  return { image, avatar }
}
