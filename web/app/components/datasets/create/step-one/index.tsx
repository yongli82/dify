'use client'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import cn from 'classnames'
import FilePreview from '../file-preview'
import FileUploader from '../file-uploader'
import NotionPagePreview from '../notion-page-preview'
import EmptyDatasetCreationModal from '../empty-dataset-creation-modal'
import s from './index.module.css'
import type { FileItem } from '@/models/datasets'
import type { DataSourceNotionPage } from '@/models/common'
import { DataSourceType } from '@/models/datasets'
import Button from '@/app/components/base/button'
import { NotionPageSelector } from '@/app/components/base/notion-page-selector'
import { useDatasetDetailContext } from '@/context/dataset-detail'

type IStepOneProps = {
  datasetId?: string
  dataSourceType?: DataSourceType
  dataSourceTypeDisable: Boolean
  hasConnection: boolean
  onSetting: () => void
  files: FileItem[]
  updateFileList: (files: FileItem[]) => void
  updateFile: (fileItem: FileItem, progress: number, list: FileItem[]) => void
  notionPages?: any[]
  updateNotionPages: (value: any[]) => void
  onStepChange: () => void
  changeType: (type: DataSourceType) => void
}

type Page = DataSourceNotionPage & { workspace_id: string }

type NotionConnectorProps = {
  onSetting: () => void
}
export const NotionConnector = ({ onSetting }: NotionConnectorProps) => {
  const { t } = useTranslation()

  return (
    <div className={s.notionConnectionTip}>
      <span className={s.notionIcon}/>
      <div className={s.title}>{t('datasetCreation.stepOne.notionSyncTitle')}</div>
      <div className={s.tip}>{t('datasetCreation.stepOne.notionSyncTip')}</div>
      <Button className='h-8' type='primary' onClick={onSetting}>{t('datasetCreation.stepOne.connect')}</Button>
    </div>
  )
}

const StepOne = ({
  datasetId,
  dataSourceType,
  dataSourceTypeDisable,
  changeType,
  hasConnection,
  onSetting,
  onStepChange,
  files,
  updateFileList,
  updateFile,
  notionPages = [],
  updateNotionPages,
}: IStepOneProps) => {
  const { dataset } = useDatasetDetailContext()
  const [showModal, setShowModal] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | undefined>()
  const [currentNotionPage, setCurrentNotionPage] = useState<Page | undefined>()
  const { t } = useTranslation()

  const modalShowHandle = () => setShowModal(true)
  const modalCloseHandle = () => setShowModal(false)

  const updateCurrentFile = (file: File) => {
    setCurrentFile(file)
  }
  const hideFilePreview = () => {
    setCurrentFile(undefined)
  }

  const updateCurrentPage = (page: Page) => {
    setCurrentNotionPage(page)
  }

  const hideNotionPagePreview = () => {
    setCurrentNotionPage(undefined)
  }

  const shouldShowDataSourceTypeList = !datasetId || (datasetId && !dataset?.data_source_type)

  const nextDisabled = useMemo(() => {
    if (!files.length)
      return true
    if (files.some(file => !file.file.id))
      return true
    return false
  }, [files])
  return (
    <div className='flex w-full h-full'>
      <div className='grow overflow-y-auto relative'>
        {
          shouldShowDataSourceTypeList && (
            <div className={s.stepHeader}>{t('datasetCreation.steps.one')}</div>
          )
        }
        <div className={s.form}>
          {
            shouldShowDataSourceTypeList && (
              <div className={s.dataSourceTypeList}>
                <div
                  className={cn(
                    s.dataSourceItem,
                    dataSourceType === DataSourceType.FILE && s.active,
                    dataSourceTypeDisable && dataSourceType !== DataSourceType.FILE && s.disabled,
                  )}
                  onClick={() => {
                    if (dataSourceTypeDisable)
                      return
                    changeType(DataSourceType.FILE)
                    hideFilePreview()
                    hideNotionPagePreview()
                  }}
                >
                  <span className={cn(s.datasetIcon)} />
                  {t('datasetCreation.stepOne.dataSourceType.file')}
                </div>
                <div
                  className={cn(
                    s.dataSourceItem,
                    dataSourceType === DataSourceType.NOTION && s.active,
                    dataSourceTypeDisable && dataSourceType !== DataSourceType.NOTION && s.disabled,
                  )}
                  onClick={() => {
                    if (dataSourceTypeDisable)
                      return
                    changeType(DataSourceType.NOTION)
                    hideFilePreview()
                    hideNotionPagePreview()
                  }}
                >
                  <span className={cn(s.datasetIcon, s.notion)} />
                  {t('datasetCreation.stepOne.dataSourceType.notion')}
                </div>
                <div
                  className={cn(s.dataSourceItem, s.disabled, dataSourceType === DataSourceType.WEB && s.active)}
                // onClick={() => changeType(DataSourceType.WEB)}
                >
                  <span className={s.comingTag}>Coming soon</span>
                  <span className={cn(s.datasetIcon, s.web)} />
                  {t('datasetCreation.stepOne.dataSourceType.web')}
                </div>
              </div>
            )
          }
          {dataSourceType === DataSourceType.FILE && (
            <>
              <FileUploader
                fileList={files}
                titleClassName={!shouldShowDataSourceTypeList ? 'mt-[30px] !mb-[44px] !text-lg !font-semibold !text-gray-900' : undefined}
                prepareFileList={updateFileList}
                onFileListUpdate={updateFileList}
                onFileUpdate={updateFile}
                onPreview={updateCurrentFile}
              />
              <Button disabled={nextDisabled} className={s.submitButton} type='primary' onClick={onStepChange}>{t('datasetCreation.stepOne.button')}</Button>
            </>
          )}
          {dataSourceType === DataSourceType.NOTION && (
            <>
              {!hasConnection && <NotionConnector onSetting={onSetting} />}
              {hasConnection && (
                <>
                  <div className='mb-8 w-[640px]'>
                    <NotionPageSelector value={notionPages.map(page => page.page_id)} onSelect={updateNotionPages} onPreview={updateCurrentPage} />
                  </div>
                  <Button disabled={!notionPages.length} className={s.submitButton} type='primary' onClick={onStepChange}>{t('datasetCreation.stepOne.button')}</Button>
                </>
              )}
            </>
          )}
          {!datasetId && (
            <>
              <div className={s.dividerLine} />
              <div onClick={modalShowHandle} className={s.OtherCreationOption}>{t('datasetCreation.stepOne.emptyDatasetCreation')}</div>
            </>
          )}
        </div>
        <EmptyDatasetCreationModal show={showModal} onHide={modalCloseHandle} />
      </div>
      {currentFile && <FilePreview file={currentFile} hidePreview={hideFilePreview} />}
      {currentNotionPage && <NotionPagePreview currentPage={currentNotionPage} hidePreview={hideNotionPagePreview} />}
    </div>
  )
}

export default StepOne
