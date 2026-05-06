import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Switch from '../../components/input/Switch';
import TemplateSelect from '../../components/TemplateSelect';
import RuleDefinition from '../SearchPage/components/RuleDefinition';
import { NewRule } from '../SearchPage/types';
import { ErrorHandlerType } from '../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../lib/backend/get2ankiApi';
import {
  CardOptionsForm,
  CardOptionsFormHandle,
} from '../../components/CardOptionsForm/CardOptionsForm';
import sharedStyles from '../../styles/shared.module.css';
import styles from './RulesPage.module.css';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

const flashCardOptions = [
  'toggle',
  'bulleted_list_item',
  'numbered_list_item',
  'heading_1',
  'heading_2',
  'heading_3',
  'column_list',
  'quote',
];
const tagOptions = ['heading', 'strikethrough'];
const subDeckOptions = ['child_page', 'child_database', ...flashCardOptions];
const deckOptions = ['page', 'database', ...subDeckOptions];

const defaultRules: NewRule = {
  id: 0,
  owner: 0,
  object_id: '',
  flashcard_is: ['toggle'],
  sub_deck_is: ['child_page'],
  tags_is: 'strikethrough',
  deck_is: ['page', 'database'],
  email_notification: false,
};

type RuleListKey = 'flashcard_is' | 'sub_deck_is' | 'deck_is';

const byLocale = (a: string, b: string) => a.localeCompare(b);

function snapshot(rules: NewRule, tags: string, email: boolean) {
  return JSON.stringify({
    flashcard_is: [...rules.flashcard_is].sort(byLocale),
    sub_deck_is: [...rules.sub_deck_is].sort(byLocale),
    deck_is: [...rules.deck_is].sort(byLocale),
    tags_is: tags,
    email_notification: email,
  });
}

export default function RulesPage({ setErrorMessage }: Readonly<Props>) {
  const { id = '' } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const titleParam = params.get('title');
  const headingTitle = titleParam ?? 'Conversion rules';
  const parent = titleParam ?? 'this page';
  const type = params.get('type');
  const returnTo = params.get('returnTo') ?? '/notion';

  const [rules, setRules] = useState<NewRule>(defaultRules);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState(defaultRules.tags_is);
  const [sendEmail, setSendEmail] = useState(defaultRules.email_notification);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState('');

  const cardOptionsRef = useRef<CardOptionsFormHandle>(null);

  const currentSnapshot = useMemo(
    () => snapshot(rules, tags, sendEmail),
    [rules, tags, sendEmail]
  );
  const isRulesDirty =
    initialSnapshot !== '' && currentSnapshot !== initialSnapshot;

  const hasUnsavedChanges = () =>
    isRulesDirty || !!cardOptionsRef.current?.isDirty();

  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadFailed(false);
    setInitialSnapshot('');
    setRules(defaultRules);
    setSendEmail(defaultRules.email_notification);
    setTags(defaultRules.tags_is);
    setFavorite(false);

    Promise.all([get2ankiApi().getRules(id), get2ankiApi().getFavorites()])
      .then(([rule, favorites]) => {
        if (cancelled) return;
        const loaded: NewRule = rule
          ? {
              ...rule,
              flashcard_is: rule.flashcard_is.split(',').filter(Boolean),
              sub_deck_is: rule.sub_deck_is.split(',').filter(Boolean),
              deck_is: rule.deck_is.split(',').filter(Boolean),
            }
          : defaultRules;
        setRules(loaded);
        setSendEmail(loaded.email_notification);
        setTags(loaded.tags_is);
        setFavorite(favorites.some((f) => f.id === id));
        setInitialSnapshot(
          snapshot(loaded, loaded.tags_is, loaded.email_notification)
        );
        setIsLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error);
        setLoadFailed(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const goBack = () => navigate(returnTo);

  const confirmDiscard = () => {
    if (!hasUnsavedChanges()) return true;
    return globalThis.confirm(
      'You have unsaved changes. Leave without saving?'
    );
  };

  const handleBack = () => {
    if (confirmDiscard()) goBack();
  };

  const saveAll = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      await get2ankiApi().saveRules(
        id,
        rules.flashcard_is,
        rules.deck_is,
        rules.sub_deck_is,
        tags,
        sendEmail
      );
      const cardOptionsOk = await cardOptionsRef.current?.save();
      if (cardOptionsOk === false) {
        setIsSaving(false);
        return;
      }
      goBack();
    } catch (error) {
      setErrorMessage(error);
      setIsSaving(false);
    }
  };

  const toggleSelection = (key: RuleListKey, value: string) => {
    setRules((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((f) => f !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const toggleFavorite = async () => {
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    const next = !favorite;
    try {
      const ok = favorite
        ? await get2ankiApi().deleteFavorite(id)
        : await get2ankiApi().addFavorite(id, type);
      if (!ok) {
        throw new Error('Failed to update favorite');
      }
      setFavorite(next);
    } catch (error) {
      setErrorMessage(error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className={sharedStyles.page}>
      <header className={sharedStyles.pageHeader}>
        <button type="button" onClick={handleBack} className={styles.backLink}>
          ← Back
        </button>
        <div className={styles.headerRow}>
          <div className={styles.headerText}>
            <h1 className={sharedStyles.title} data-hj-suppress>
              {headingTitle}
            </h1>
            <p className={sharedStyles.subtitle}>
              Tell 2anki which Notion blocks should become decks, sub-decks, and
              flashcards {titleParam ? `for ${parent}` : ''}.
            </p>
          </div>
          <button
            type="button"
            className={`${styles.favoriteButton} ${
              favorite ? styles.favoriteActive : ''
            }`}
            onClick={toggleFavorite}
            disabled={isTogglingFavorite || isLoading}
            aria-pressed={favorite}
          >
            <span aria-hidden="true">{favorite ? '★' : '☆'}</span>
            {favorite ? 'Favorited' : 'Favorite'}
          </button>
        </div>
      </header>

      {isLoading && (
        <div className={`${styles.card} ${styles.loadingCard}`}>
          <div className={sharedStyles.spinner} />
        </div>
      )}
      {!isLoading && loadFailed && (
        <div className={`${styles.card} ${styles.loadingCard}`}>
          <p>Couldn&apos;t load rules for this page. Please try again.</p>
        </div>
      )}
      {!isLoading && !loadFailed && (
        <>
          <div className={styles.card}>
            <RuleDefinition
              title="What counts as a deck?"
              description="The top-level blocks that appear in your Anki deck overview."
              value={rules.deck_is}
              options={deckOptions}
              onSelected={(fco) => toggleSelection('deck_is', fco)}
            />
            <RuleDefinition
              title="What counts as a sub-deck?"
              description="Nested under the decks above."
              value={rules.sub_deck_is}
              options={subDeckOptions}
              onSelected={(fco) => toggleSelection('sub_deck_is', fco)}
            />
            <RuleDefinition
              title="What counts as a flashcard?"
              description="Block types converted into individual cards."
              value={rules.flashcard_is}
              options={flashCardOptions}
              onSelected={(fco) => toggleSelection('flashcard_is', fco)}
            />

            <div className={styles.miscSection}>
              <div>
                <label htmlFor="tags-format" className={styles.miscLabel}>
                  Tag format
                </label>
                <p className={sharedStyles.smallDescription}>
                  Which Notion formatting marks a block as a tag.
                </p>
                <TemplateSelect
                  data-hj-suppress
                  pickedTemplate={(name: string) => setTags(name)}
                  values={tagOptions.map((fco) => ({
                    label: `Tags are ${fco}`,
                    value: fco,
                  }))}
                  name="tags-format"
                  value={tags}
                />
              </div>

              <Switch
                id="email-notification"
                title="Email me when conversion is ready"
                checked={sendEmail}
                onSwitched={() => setSendEmail((prev) => !prev)}
              />
            </div>
          </div>

          <section className={styles.card}>
            <header className={styles.sectionHeader}>
              <h2 className={sharedStyles.subHeading}>Card options</h2>
              <p className={sharedStyles.subtitle}>
                Customize the deck name, templates, and conversion behavior for
                this page.
              </p>
            </header>
            <CardOptionsForm
              ref={cardOptionsRef}
              pageId={id}
              pageTitle={parent}
              setError={setErrorMessage}
              hideActions
            />
          </section>

          <div className={styles.stickyActions}>
            <button
              type="button"
              className={`${sharedStyles.btnSecondary} ${styles.actionButton}`}
              onClick={handleBack}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`${sharedStyles.btnPrimary} ${styles.actionButton}`}
              onClick={saveAll}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
