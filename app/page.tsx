import { Welcome } from '@/components/modals/welcome'
import { cookies } from 'next/headers'
import { getHorizontal, getVertical } from '@/components/layout/sizing'
import { hideBanner } from '@/app/actions'
import { ClientPage } from './client-page'

export default async function Page() {
  const store = await cookies()
  const banner = store.get('banner-hidden')?.value !== 'true'
  const horizontalSizes = getHorizontal(store)
  const verticalSizes = getVertical(store)
  return (
    <>
      <Welcome defaultOpen={banner} onDismissAction={hideBanner} />
      <ClientPage horizontalSizes={horizontalSizes} verticalSizes={verticalSizes} />
    </>
  )
}
