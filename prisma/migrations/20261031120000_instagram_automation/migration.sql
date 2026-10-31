-- CreateTable
CREATE TABLE "IgCredential" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "accessToken" TEXT NOT NULL,
    "envTokenHash" TEXT NOT NULL,
    "igUserId" TEXT,
    "username" TEXT,
    "expiresAt" TIMESTAMPTZ(6),
    "issuedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refreshedAt" TIMESTAMPTZ(6),
    "lastError" TEXT,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IgCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgScheduledPost" (
    "id" UUID NOT NULL,
    "caption" TEXT NOT NULL,
    "videoFile" TEXT NOT NULL,
    "coverFile" TEXT,
    "shareToFeed" BOOLEAN NOT NULL DEFAULT true,
    "publishAt" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "containerId" TEXT,
    "mediaId" TEXT,
    "permalink" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "publishedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IgScheduledPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgRule" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "matchMode" TEXT NOT NULL DEFAULT 'word',
    "mediaId" TEXT,
    "scheduledPostId" UUID,
    "publicReplies" TEXT[],
    "dmText" TEXT NOT NULL,
    "dmButton" TEXT,
    "linkText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IgRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgCommentEvent" (
    "id" UUID NOT NULL,
    "commentId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "fromUsername" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "parentId" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "skipReason" TEXT,
    "ruleId" UUID,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "publicReplyText" TEXT,
    "publicReplyId" TEXT,
    "publicReplyAt" TIMESTAMPTZ(6),
    "dmSentText" TEXT,
    "dmMessageId" TEXT,
    "dmSentAt" TIMESTAMPTZ(6),
    "recipientId" TEXT,
    "followUpPending" BOOLEAN NOT NULL DEFAULT false,
    "followUpSentAt" TIMESTAMPTZ(6),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "commentCreatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receivedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IgCommentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IgInboundMessage" (
    "id" UUID NOT NULL,
    "mid" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "text" TEXT,
    "payload" TEXT,
    "outcome" TEXT NOT NULL,
    "receivedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IgInboundMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortLink" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "asin" TEXT,
    "url" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShortLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkClick" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "source" TEXT,
    "ruleId" UUID,
    "mediaId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IgScheduledPost_status_publishAt_idx" ON "IgScheduledPost"("status", "publishAt");

-- CreateIndex
CREATE UNIQUE INDEX "IgRule_key_key" ON "IgRule"("key");

-- CreateIndex
CREATE INDEX "IgRule_mediaId_idx" ON "IgRule"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "IgCommentEvent_commentId_key" ON "IgCommentEvent"("commentId");

-- CreateIndex
CREATE INDEX "IgCommentEvent_status_idx" ON "IgCommentEvent"("status");

-- CreateIndex
CREATE INDEX "IgCommentEvent_fromId_ruleId_idx" ON "IgCommentEvent"("fromId", "ruleId");

-- CreateIndex
CREATE INDEX "IgCommentEvent_recipientId_idx" ON "IgCommentEvent"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "IgInboundMessage_mid_key" ON "IgInboundMessage"("mid");

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_slug_key" ON "ShortLink"("slug");

-- CreateIndex
CREATE INDEX "LinkClick_linkId_createdAt_idx" ON "LinkClick"("linkId", "createdAt");

-- CreateIndex
CREATE INDEX "LinkClick_ruleId_idx" ON "LinkClick"("ruleId");

-- AddForeignKey
ALTER TABLE "IgRule" ADD CONSTRAINT "IgRule_scheduledPostId_fkey" FOREIGN KEY ("scheduledPostId") REFERENCES "IgScheduledPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IgCommentEvent" ADD CONSTRAINT "IgCommentEvent_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "IgRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkClick" ADD CONSTRAINT "LinkClick_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ShortLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

